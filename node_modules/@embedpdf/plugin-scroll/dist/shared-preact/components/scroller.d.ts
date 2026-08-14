import { ReactNode, HTMLAttributes } from '../../preact/adapter.ts';
import { PageLayout } from '../../lib/index.ts';
type ScrollerProps = HTMLAttributes<HTMLDivElement> & {
    documentId: string;
    renderPage: (props: PageLayout) => ReactNode;
};
export declare function Scroller({ documentId, renderPage, ...props }: ScrollerProps): import("preact").JSX.Element | null;
export {};
