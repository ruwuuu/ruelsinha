import { ReactNode } from '../../preact/adapter.ts';
import { DocumentState } from '@embedpdf/core';
export interface TabActions {
    select: (documentId: string) => void;
    close: (documentId: string) => void;
    move: (documentId: string, toIndex: number) => void;
}
export interface DocumentContextRenderProps {
    documentStates: DocumentState[];
    activeDocumentId: string | null;
    actions: TabActions;
}
interface DocumentContextProps {
    children: (props: DocumentContextRenderProps) => ReactNode;
}
/**
 * Headless component for managing document tabs
 * Provides all state and actions, completely UI-agnostic
 *
 * @example
 * <DocumentContext>
 *   {({ documents, activeDocumentId, actions }) => (
 *     <div className="tabs">
 *       {documents.map((doc) => (
 *         <button
 *           key={doc.id}
 *           onClick={() => actions.select(doc.id)}
 *           className={doc.id === activeDocumentId ? 'active' : ''}
 *         >
 *           {doc.name}
 *           <button onClick={(e) => {
 *             e.stopPropagation();
 *             actions.close(doc.id);
 *           }}>×</button>
 *         </button>
 *       ))}
 *     </div>
 *   )}
 * </DocumentContext>
 */
export declare function DocumentContext({ children }: DocumentContextProps): import("preact").JSX.Element;
export {};
