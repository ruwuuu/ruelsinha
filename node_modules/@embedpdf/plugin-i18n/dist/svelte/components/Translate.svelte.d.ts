interface TranslateProps {
    k: string;
    params?: Record<string, string | number>;
    fallback?: string;
    documentId?: string;
}
declare const Translate: import('svelte', { with: { "resolution-mode": "import" } }).Component<TranslateProps, {}, "">;
type Translate = ReturnType<typeof Translate>;
export default Translate;
