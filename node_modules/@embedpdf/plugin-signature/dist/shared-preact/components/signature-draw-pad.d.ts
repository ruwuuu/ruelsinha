import { SignatureInkFieldDefinition } from '../../lib/index.ts';
export interface SignatureDrawPadHandle {
    clear(): void;
}
export interface SignatureDrawPadProps {
    onResult: (result: SignatureInkFieldDefinition | null) => void;
    padRef?: (handle: SignatureDrawPadHandle | null) => void;
    strokeColor?: string;
    strokeWidth?: number;
    className?: string;
}
export declare function SignatureDrawPad({ onResult, padRef, strokeColor, strokeWidth, className, }: SignatureDrawPadProps): import("preact").JSX.Element;
