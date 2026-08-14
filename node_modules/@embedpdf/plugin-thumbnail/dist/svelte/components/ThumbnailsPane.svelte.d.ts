import { Snippet } from 'svelte';
import { ThumbMeta } from '../../lib/index.ts';
import { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /**
     * The ID of the document that this thumbnail pane displays
     */
    documentId: string;
    children: Snippet<[ThumbMeta]>;
}
declare const ThumbnailsPane: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type ThumbnailsPane = ReturnType<typeof ThumbnailsPane>;
export default ThumbnailsPane;
