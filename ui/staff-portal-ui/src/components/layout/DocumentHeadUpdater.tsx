"use client";

import { useEffect } from "react";
import { useRuntimeConfig } from "@/context/RuntimeConfigContext";

/** Applies registry-specific title and favicon after the single server config fetch. */
export function DocumentHeadUpdater() {
    const { config } = useRuntimeConfig();

    useEffect(() => {
        if (config.registryName) {
            document.title = config.registryName;
        }

        if (!config.registryLogo) return;

        let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = config.registryLogo;
    }, [config.registryName, config.registryLogo]);

    return null;
}
