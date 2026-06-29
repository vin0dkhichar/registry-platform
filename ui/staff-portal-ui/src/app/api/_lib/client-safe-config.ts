import "server-only";
import { cache } from "react";
import { getBackendConfig } from "./backend-config";
import { createBackendRequest } from "./backend-request";
import { getServerEnv } from "./env-config";
import { requireAuthFromCookies } from "./requireAuth";
import { getOrigin } from "./get-origin";

import { Branding, ClientSafeConfigShape, LanguageConfig } from "./client-safe-config.types";

function getDefaultConfig(): ClientSafeConfigShape {
    const env = getServerEnv();
    return {
        partnerImportExportEnable: env.partnerImportExportEnable,
        verifyServiceUrl: env.verifyServiceUrl,
        vpClientId: env.vpClientId,
        pageSize: env.pageSize,
        registryName: "",
        registryLogo: "",
        registry_theme_id: "",
        registry_language_id: "",
        branding: {},
    };
}

async function fetchLanguageById(
    language_id: string,
    origin: string,
    backendHeaders: Record<string, string>
): Promise<LanguageConfig | undefined> {
    const backendConfig = getBackendConfig();
    const languageUrl = `${backendConfig.backendApiUrl}/registry-language/get_language`;
    const languageRequest = createBackendRequest({
        request_payload: { language_id },
    }, origin);

    try {
        console.log("[server-config] API call: get_language", { language_id });
        const languageResponse = await fetch(languageUrl, {
            method: "POST",
            headers: backendHeaders,
            body: JSON.stringify(languageRequest),
            cache: "no-store",
        });

        if (languageResponse.ok) {
            const languageData = await languageResponse.json();
            return languageData.response_body?.response_payload;
        }
    } catch (error) {
        console.error(`Failed to fetch language config for id ${language_id}:`, error);
    }
    return undefined;
}

const fetchAllLanguages = cache(async (): Promise<LanguageConfig[]> => {
    console.log("[server-config] API call: get_all_languages");
    const origin = await getOrigin();
    const backendConfig = getBackendConfig();
    const auth = await requireAuthFromCookies();
    if (!auth) return [];

    const languagesUrl = `${backendConfig.backendApiUrl}/registry-language/get_all_languages`;
    const languagesRequest = createBackendRequest({
        request_payload: {},
        pagination_request: { current_page: 1, page_size: 100 },
    }, origin);

    try {
        const response = await fetch(languagesUrl, {
            method: "POST",
            headers: auth.backendHeaders,
            body: JSON.stringify(languagesRequest),
            cache: "no-store",
        });

        if (response.ok) {
            const data = await response.json();
            return data.response_body?.response_payload || [];
        }
    } catch (error) {
        console.error("Failed to fetch languages:", error);
    }
    return [];
});

export async function getLanguageConfigByCode(
    language_code: string
): Promise<LanguageConfig | undefined> {
    console.log("[server-config] getLanguageConfigByCode", { language_code });
    const languages = await fetchAllLanguages();
    const match = languages.find(l => l.language_code === language_code);
    console.log("[server-config] getLanguageConfigByCode result", {
        language_code,
        found: Boolean(match),
    });
    return match;
}

const fetchRegistryConfigFromBackend = cache(async (): Promise<ClientSafeConfigShape> => {
    console.log("[server-config] API call: get_registry_configuration");
    const origin = await getOrigin();
    const config = getDefaultConfig();
    const backendConfig = getBackendConfig();
    const backendUrl = `${backendConfig.backendApiUrl}/registry-config/get_registry_configuration`;

    try {
        const auth = await requireAuthFromCookies();
        if (!auth) return config;

        const backendRequest = createBackendRequest({ request_payload: {} }, origin);

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: auth.backendHeaders,
            body: JSON.stringify(backendRequest),
            cache: "no-store",
        });

        if (!response.ok) return config;

        const data = await response.json();
        const rawPayload = data.response_body?.response_payload;
        const payload = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload;
        const theme_id = payload?.registry_theme_id;

        let branding: Branding = {};

        if (theme_id) {
            console.log("[server-config] API call: get_theme_values", { theme_id });
            const themeUrl = `${backendConfig.backendApiUrl}/registry-theme/get_theme_values`;
            const themeRequest = createBackendRequest({
                request_payload: { theme_id },
            }, origin);

            const themeResponse = await fetch(themeUrl, {
                method: "POST",
                headers: auth.backendHeaders,
                body: JSON.stringify(themeRequest),
                cache: "no-store",
            });

            if (themeResponse.ok) {
                const themeData = await themeResponse.json();
                const attributes = themeData.response_body?.response_payload || [];

                attributes.forEach((attr: { attribute_name: string; attribute_value: string }) => {
                    (branding as Record<string, string>)[attr.attribute_name] = attr.attribute_value;
                });
            }
        }

        const language_id = payload?.registry_language_id;
        let language_config: LanguageConfig | undefined;

        if (language_id) {
            language_config = await fetchLanguageById(language_id, origin, auth.backendHeaders);
        }

        return {
            ...config,
            registryName: payload?.registry_name ?? "",
            registryLogo: payload?.registry_logo ?? "",
            registry_theme_id: theme_id ?? "",
            registry_language_id: language_id ?? "",
            branding,
            language_config,
        };
    } catch (error) {
        console.error("Failed to fetch registry config:", error);
        return config;
    }
});

export async function getServerRegistryConfig(): Promise<ClientSafeConfigShape> {
    return fetchRegistryConfigFromBackend();
}
