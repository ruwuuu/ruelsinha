import { useCapability, usePlugin } from "@embedpdf/core/preact";
import { BookmarkPlugin } from "@embedpdf/plugin-bookmark";
export * from "@embedpdf/plugin-bookmark";
const useBookmarkPlugin = () => usePlugin(BookmarkPlugin.id);
const useBookmarkCapability = () => useCapability(BookmarkPlugin.id);
export {
  useBookmarkCapability,
  useBookmarkPlugin
};
//# sourceMappingURL=index.js.map
