import { createPluginPackage } from "@embedpdf/core";
import { FullscreenPlugin, initialState, FullscreenPluginPackage as FullscreenPluginPackage$1 } from "@embedpdf/plugin-fullscreen";
export * from "@embedpdf/plugin-fullscreen";
import { jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useCapability, usePlugin } from "@embedpdf/core/react";
const useFullscreenPlugin = () => usePlugin(FullscreenPlugin.id);
const useFullscreenCapability = () => useCapability(FullscreenPlugin.id);
const useFullscreen = () => {
  const { provides } = useFullscreenCapability();
  const [state, setState] = useState(initialState);
  useEffect(() => {
    return provides == null ? void 0 : provides.onStateChange((state2) => {
      setState(state2);
    });
  }, [provides]);
  return {
    provides,
    state
  };
};
function findFullscreenElement(event, containerElement, targetSelector) {
  if (!containerElement || event.action !== "enter") {
    return containerElement;
  }
  let elementToFullscreen = null;
  if (targetSelector) {
    elementToFullscreen = containerElement.querySelector(targetSelector);
    if (!elementToFullscreen) {
      console.warn(
        `Fullscreen: Could not find element with selector "${targetSelector}" within the wrapper. Falling back to wrapper element.`
      );
    }
  }
  if (!elementToFullscreen) {
    elementToFullscreen = containerElement;
  }
  return elementToFullscreen;
}
async function handleFullscreenRequest(event, containerElement, targetSelector) {
  if (event.action === "enter") {
    const elementToFullscreen = findFullscreenElement(event, containerElement, targetSelector);
    if (elementToFullscreen && !document.fullscreenElement) {
      await elementToFullscreen.requestFullscreen();
    }
  } else {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }
}
function FullscreenProvider({ children, ...props }) {
  const { provides: fullscreenCapability } = useFullscreenCapability();
  const { plugin: fullscreenPlugin } = useFullscreenPlugin();
  const { plugin } = useFullscreenPlugin();
  const ref = useRef(null);
  useEffect(() => {
    if (!fullscreenCapability || !fullscreenPlugin) return;
    const unsub = fullscreenCapability.onRequest(async (event) => {
      const targetSelector = fullscreenPlugin.getTargetSelector();
      await handleFullscreenRequest(event, ref.current, targetSelector);
    });
    return unsub;
  }, [fullscreenCapability, fullscreenPlugin]);
  useEffect(() => {
    if (!plugin) return;
    const handler = () => plugin.setFullscreenState(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [plugin]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      style: { position: "relative", width: "100%", height: "100%", ...props.style },
      ref,
      children
    }
  );
}
const FullscreenPluginPackage = createPluginPackage(FullscreenPluginPackage$1).addWrapper(FullscreenProvider).build();
export {
  FullscreenPluginPackage,
  FullscreenProvider,
  useFullscreen,
  useFullscreenCapability,
  useFullscreenPlugin
};
//# sourceMappingURL=index.js.map
