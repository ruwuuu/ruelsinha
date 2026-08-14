import { SignatureStampFieldDefinition } from '../../lib/index.ts';
export interface SignatureTypePadHandle {
    clear(): void;
}
export interface SignatureTypePadProps {
    onResult: (result: SignatureStampFieldDefinition | null) => void;
    padRef?: (handle: SignatureTypePadHandle | null) => void;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    className?: string;
    placeholder?: string;
}
export declare function SignatureTypePad({ onResult, padRef, fontFamily, fontSize, color, className, placeholder, }: SignatureTypePadProps): import("preact").JSX.Element;
