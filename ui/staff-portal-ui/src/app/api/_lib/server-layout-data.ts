import "server-only";
import { cache } from "react";
import { routing } from "@/i18n/routing";
import { getLanguageMessages, TranslationMap } from "@/features/configuration/registry/utils/language.helpers";
import { ClientSafeConfigShape } from "./client-safe-config.types";
import { getLanguageConfigByCode, getServerRegistryConfig } from "./client-safe-config";

export type ServerLayoutData = {
    locale: string;
    config: ClientSafeConfigShape;
    messages: TranslationMap;
};

/**
 * Single server entry point for registry config + i18n messages.
 * React cache() deduplicates within one render/request when called from
 * RootLayout and next-intl getRequestConfig.
 */
export const getServerLayoutData = cache(async (locale: string): Promise<ServerLayoutData> => {
    console.log("[server-config] getServerLayoutData: cache miss — loading layout data", { locale });

    const resolvedLocale = routing.locales.includes(locale as (typeof routing.locales)[number])
        ? locale
        : routing.defaultLocale;

    const config = await getServerRegistryConfig();

    const registryLanguageCode = config.language_config?.language_code;
    const needsLocaleLookup = Boolean(registryLanguageCode && registryLanguageCode !== resolvedLocale);
    let messages = getLanguageMessages(config.language_config);

    if (needsLocaleLookup) {
        console.log("[server-config] getServerLayoutData: resolving locale by code", {
            locale: resolvedLocale,
            registryLanguage: registryLanguageCode,
        });
        const dynamicLang = await getLanguageConfigByCode(resolvedLocale);
        messages = getLanguageMessages(dynamicLang);
    }

    console.log("[server-config] getServerLayoutData: done", {
        locale: resolvedLocale,
        registryName: config.registryName,
        registryLanguage: registryLanguageCode,
        needsLocaleLookup,
    });

    return {
        locale: resolvedLocale,
        config,
        messages,
    };
});
