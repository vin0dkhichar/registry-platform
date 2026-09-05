"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ChangeRequestDetailsView } from "@/features/change-request/components";
import { useBreadcrumb } from "@/shared/hooks";

export default function RegisterChangeRequestDetailsPage() {
    const { type: registerType, id, changeId } = useParams<{
        type: string;
        id: string;
        changeId: string;
    }>();
    const internalRecordId = id ? decodeURIComponent(id) : undefined;
    const searchParams = useSearchParams();
    const recordName = searchParams.get('recordName') ? decodeURIComponent(searchParams.get('recordName') || '') : null;

    const breadcrumb = useBreadcrumb({
        registerType,
        internalRecordId,
        recordName,
        changeId,
        includeActiveTab: true,
        includeChangeRequest: true,
    });

    return (
        <ChangeRequestDetailsView
            changeId={changeId}
            breadcrumb={breadcrumb}
        />
    );
}
