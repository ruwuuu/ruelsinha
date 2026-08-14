import { SignatureStampFieldDefinition } from '../../lib/index.ts';
type __VLS_Props = {
    onResult: (result: SignatureStampFieldDefinition | null) => void;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    placeholder?: string;
};
declare function clear(): void;
declare const __VLS_export: import('vue').DefineComponent<__VLS_Props, {
    clear: typeof clear;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    color: string;
    fontFamily: string;
    fontSize: number;
    placeholder: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
