import { SignatureEntry, SignatureCreationType } from './types';
export interface SerializedSignatureStampField {
    creationType: SignatureCreationType.Type | SignatureCreationType.Upload;
    label?: string;
    previewDataUrl: string;
    imageMimeType?: string;
    imageSize?: {
        width: number;
        height: number;
    };
    imageData?: string;
}
export type SerializedSignatureFieldDefinition = import('./types').SignatureInkFieldDefinition | SerializedSignatureStampField;
export interface SerializedSignatureEntry {
    id: string;
    createdAt: number;
    signature: SerializedSignatureFieldDefinition;
    initials?: SerializedSignatureFieldDefinition;
}
/**
 * Converts signature entries into a JSON-safe format by encoding
 * ArrayBuffer fields as base64 strings. Use with `JSON.stringify`
 * for persistence (e.g. localStorage, IndexedDB, or a backend API).
 */
export declare function serializeEntries(entries: SignatureEntry[]): SerializedSignatureEntry[];
/**
 * Restores signature entries from the JSON-safe format produced by
 * `serializeEntries`, converting base64 strings back to ArrayBuffers.
 */
export declare function deserializeEntries(data: SerializedSignatureEntry[]): SignatureEntry[];
