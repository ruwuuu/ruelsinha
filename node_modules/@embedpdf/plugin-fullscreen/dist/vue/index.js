import { createPluginPackage } from "@embedpdf/core";
import { FullscreenPlugin, initialState, FullscreenPluginPackage as FullscreenPluginPackage$1 } from "@embedpdf/plugin-fullscreen";
export * from "@embedpdf/plugin-fullscreen";
import { ref, watchEffect, defineComponent, onMounted, onUnmounted, openBlock, createElementBlock, renderSlot } from "vue";
import { useCapability, usePlugin } from "@embedpdf/core/vue";
const useFullscreenPlugin = () => usePlugin(FullscreenPlugin.id);
const useFullscreenCapability = () => useCapability(FullscreenPlugin.id);
const useFullscreen = () => {
  const { provides: fullscreenProviderRef } = useFullscreenCapability();
  const state = ref(initialState);
  watchEffect((onCleanup) => {
    const fullscreenProvider = fullscreenProviderRef.value;
    if (fullscreenProvider) {
      const unsubscribe = fullscreenProvider.onStateChange((newState) => {
        state.value = newState;
      });
      onCleanup(() => {
        unsubscribe();
      });
    }
  });
  return {
    provides: fullscreenProviderRef,
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
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "fullscreen",
  setup(__props) {
    const { provides: fullscreenCapabilityRef } = useFullscreenCapability();
    const { plugin: fullscreenPluginRef } = useFullscreenPlugin();
    const containerRef = ref(null);
    let unsubscribe = null;
    let fullscreenChangeUnsubscribe = null;
    onMounted(() => {
      const fullscreenCapability = fullscreenCapabilityRef.value;
      const fullscreenPlugin = fullscreenPluginRef.value;
      if (fullscreenCapability && fullscreenPlugin) {
        unsubscribe = fullscreenCapability.onRequest(async (event) => {
          const targetSelector = fullscreenPlugin.getTargetSelector();
          await handleFullscreenRequest(event, containerRef.value, targetSelector);
        });
      }
      const plugin = fullscreenPluginRef.value;
      if (plugin) {
        const handler = () => {
          plugin.setFullscreenState(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handler);
        fullscreenChangeUnsubscribe = () => {
          document.removeEventListener("fullscreenchange", handler);
        };
      }
    });
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (fullscreenChangeUnsubscribe) {
        fullscreenChangeUnsubscribe();
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "containerRef",
        ref: containerRef,
        style: {
          position: "relative",
          width: "100%",
          height: "100%"
        }
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
const FullscreenPluginPackage = createPluginPackage(FullscreenPluginPackage$1).addWrapper(_sfc_main).build();
export {
  FullscreenPluginPackage,
  _sfc_main as FullscreenProvider,
  useFullscreen,
  useFullscreenCapability,
  useFullscreenPlugin
};
//# sourceMappingURL=index.js.map
