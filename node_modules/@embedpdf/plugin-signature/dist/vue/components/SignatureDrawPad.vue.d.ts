import { SignatureInkFieldDefinition } from '../../lib/index.ts';
type __VLS_Props = {
    onResult: (result: SignatureInkFieldDefinition | null) => void;
    strokeColor?: string;
    strokeWidth?: number;
};
declare function clear(): void;
declare const __VLS_export: import('vue').DefineComponent<__VLS_Props, {
    clear: typeof clear;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    strokeWidth: number;
    strokeColor: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
