"use client";

import { useMemo, useState } from "react";
import { normalizeNumericFilter } from "@/features/filter/utils";
import { AppliedFilters, FilterConfig, FilterRule } from "@/features/filter/types";

export const CHANGE_REQUEST_FILTERS: FilterConfig[] = [
    {
        field_name: "approval_status",
        display_label: "approval_status",
        filter_type: "dropdown",
        order: 1,
        allowed_operators: ["eq", "in"],
        options_source: [
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "CANCELLED", label: "Cancelled" },
        ],
    },
    {
        field_name: "register_id",
        display_label: "register",
        filter_type: "text",
        order: 2,
        allowed_operators: ["eq"],
    },
];

export function useChangeRequestFilters() {
    const filterConfig = CHANGE_REQUEST_FILTERS;
    const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>([]);

    const applyFilters = (filters: AppliedFilters) => {
        setAppliedFilters(prev => {
            const map = new Map<string, FilterRule>();
            prev.forEach(f => map.set(`${f.field_name}__${f.operator}`, f));
            filters.forEach(f => map.set(`${f.field_name}__${f.operator}`, f));
            return Array.from(map.values());
        });
    };

    const filterBy = useMemo(() => {
        if (!appliedFilters.length) return "";

        const configByField = Object.fromEntries(
            filterConfig.map(c => [c.field_name, c])
        );
        const result: Record<string, Record<string, unknown>> = {};

        for (const rule of appliedFilters) {
            const cfg = configByField[rule.field_name];
            if (!result[rule.field_name]) result[rule.field_name] = {};
            result[rule.field_name][rule.operator] = normalizeNumericFilter(
                cfg?.filter_type,
                rule.operator,
                rule.value,
            );
        }

        return result;
    }, [appliedFilters, filterConfig]);

    return {
        appliedFilters,
        filterBy,
        filterConfig,
        applyFilters,
        removeFilter: (index: number) => setAppliedFilters(prev => prev.filter((_, i) => i !== index)),
        clearAllFilters: () => setAppliedFilters([]),
    };
}
