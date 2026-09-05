import { useMemo, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RegisterContext } from '@/context/RegisterContext';
import { RegisterTabsContext } from '@/context/RegisterTabsContext';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbOptions {
    registerType?: string;
    recordName?: string | null;
    internalRecordId?: string | null;
    changeId?: string;
    includeActiveTab?: boolean;
    includeChangeRequest?: boolean;
    customItems?: BreadcrumbItem[];
    rootItem?: BreadcrumbItem;
}

export function useBreadcrumb(options: BreadcrumbOptions) {
    const t = useTranslations();
    const registerCtx = useContext(RegisterContext);
    const tabsCtx = useContext(RegisterTabsContext);

    const currentRegister = registerCtx?.currentRegister;
    const activeTab = tabsCtx?.activeTab;
    const activeTabId = tabsCtx?.activeTabId;

    const searchParams = useSearchParams();
    const {
        registerType,
        recordName,
        internalRecordId,
        changeId,
        includeChangeRequest = false,
        customItems = [],
        rootItem,
    } = options;

    return useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [];
        const search = searchParams.toString();

        if (rootItem) {
            items.push(rootItem);
        }

        if (currentRegister && registerType) {
            items.push({
                label: t(currentRegister.register_subject) ?? currentRegister.register_subject,
                href: `/register/${registerType}${search ? `?${search}` : ''}`,
            });

            if (internalRecordId && recordName?.trim()) {
                const params = new URLSearchParams(search);
                params.set('recordName', recordName);
                items.push({
                    label: recordName,
                    href: `/register/${registerType}/${internalRecordId}${params.toString() ? `?${params.toString()}` : ''}`,
                });
            }

            if (includeChangeRequest && internalRecordId) {
                const params = new URLSearchParams();
                if (activeTabId) params.set('tab', activeTabId);
                if (recordName) params.set('recordName', recordName);
                items.push({
                    label: t('change_request') ?? 'Change Request',
                    href: `/register/${registerType}/${internalRecordId}/change-request${params.toString() ? `?${params.toString()}` : ''}`,
                });
            }

            if (changeId && internalRecordId) {
                const params = new URLSearchParams();
                if (activeTabId) params.set('tab', activeTabId);
                if (recordName) params.set('recordName', recordName);
                items.push({
                    label: recordName?.trim() || "",
                    href: `/register/${registerType}/${internalRecordId}/change-request/${changeId}${params.toString() ? `?${params.toString()}` : ''}`,
                });
            }
        }

        items.push(...customItems);

        return items;
    }, [
        currentRegister,
        registerType,
        internalRecordId,
        changeId,
        includeChangeRequest,
        activeTab,
        activeTabId,
        customItems,
        rootItem,
        recordName,
        t,
        searchParams,
    ]);
}
