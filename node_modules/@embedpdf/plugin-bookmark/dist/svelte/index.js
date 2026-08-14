import { usePlugin, useCapability } from "@embedpdf/core/svelte";
import { BookmarkPlugin } from "@embedpdf/plugin-bookmark";
const useBookmarkPlugin = () => usePlugin(BookmarkPlugin.id);
const useBookmarkCapability = () => useCapability(BookmarkPlugin.id);
export {
  useBookmarkCapability,
  useBookmarkPlugin
};
//# sourceMappingURL=index.js.map
