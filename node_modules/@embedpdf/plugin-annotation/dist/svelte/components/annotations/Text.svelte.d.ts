interface TextProps {
    isSelected: boolean;
    color?: string;
    opacity?: number;
    onClick?: (e: PointerEvent) => void;
    appearanceActive?: boolean;
}
declare const Text: import('svelte', { with: { "resolution-mode": "import" } }).Component<TextProps, {}, "">;
type Text = ReturnType<typeof Text>;
export default Text;
