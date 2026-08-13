import { SignatureInkFieldDefinition } from '../../lib/index.ts';
interface Props {
    onResult: (result: SignatureInkFieldDefinition | null) => void;
    strokeColor?: string;
    strokeWidth?: number;
    class?: string;
}
declare const SignatureDrawPad: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {
    clear: () => void;
}, "">;
type SignatureDrawPad = ReturnType<typeof SignatureDrawPad>;
export default SignatureDrawPad;
