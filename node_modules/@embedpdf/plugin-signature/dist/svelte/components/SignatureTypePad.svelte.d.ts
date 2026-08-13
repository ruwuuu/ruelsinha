import { SignatureStampFieldDefinition } from '../../lib/index.ts';
interface Props {
    onResult: (result: SignatureStampFieldDefinition | null) => void;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    class?: string;
    placeholder?: string;
}
declare const SignatureTypePad: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {
    clear: () => void;
}, "">;
type SignatureTypePad = ReturnType<typeof SignatureTypePad>;
export default SignatureTypePad;
