import { ComponentProps, createElement } from 'react';
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

const { Link: BaseLink, redirect, usePathname, useRouter } = createNavigation(routing);

/** Prefetch disabled by default — prefetched RSC payloads would re-run the layout and hit the backend. */
export function Link(props: ComponentProps<typeof BaseLink>) {
    const { prefetch = false, ...rest } = props;
    return createElement(BaseLink, { prefetch, ...rest });
}

export { redirect, usePathname, useRouter };
