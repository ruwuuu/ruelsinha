import { usePlugin, useCapability } from "@embedpdf/core/svelte";
import { AttachmentPlugin } from "@embedpdf/plugin-attachment";
const useAttachmentPlugin = () => usePlugin(AttachmentPlugin.id);
const useAttachmentCapability = () => useCapability(AttachmentPlugin.id);
export {
  useAttachmentCapability,
  useAttachmentPlugin
};
//# sourceMappingURL=index.js.map
