import { useCapability, usePlugin } from "@embedpdf/core/react";
import { AttachmentPlugin } from "@embedpdf/plugin-attachment";
export * from "@embedpdf/plugin-attachment";
const useAttachmentPlugin = () => usePlugin(AttachmentPlugin.id);
const useAttachmentCapability = () => useCapability(AttachmentPlugin.id);
export {
  useAttachmentCapability,
  useAttachmentPlugin
};
//# sourceMappingURL=index.js.map
