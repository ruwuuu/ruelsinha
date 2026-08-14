import { ReactNode, HTMLAttributes } from '../../react/adapter.ts';
import { PageLayout } from '../../lib/index.ts';
type ScrollerProps = HTMLAttributes<HTMLDivElement> & {
    documentId: string;
    renderPage: (props: PageLayout) => ReactNode;
};
export declare function Scroller({ documentId, renderPage, ...props }: ScrollerProps): import("react/jsx-runtime").JSX.Element | null;
export {};
