import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { getServerLayoutData } from '@/app/api/_lib/server-layout-data';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
        locale = routing.defaultLocale;
    }

    console.log("[server-config] i18n/request: getServerLayoutData", { locale });
    const { messages } = await getServerLayoutData(locale);
    console.log("[server-config] i18n/request: done", { locale, messageKeys: Object.keys(messages).length });

    return {
        locale,
        messages,
    };
});
