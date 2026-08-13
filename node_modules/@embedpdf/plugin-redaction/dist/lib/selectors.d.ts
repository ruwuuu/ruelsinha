import { RedactionState, RedactionDocumentState } from './types';
export declare const getPendingRedactionsCount: (s: RedactionDocumentState) => number;
export declare const hasPendingRedactions: (s: RedactionDocumentState) => boolean;
export declare const getDocumentPendingCount: (state: RedactionState, documentId: string) => number;
export declare const getTotalPendingCount: (state: RedactionState) => number;
