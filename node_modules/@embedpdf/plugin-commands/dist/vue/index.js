import { createPluginPackage } from "@embedpdf/core";
import { CommandsPlugin, CommandsPluginPackage as CommandsPluginPackage$1 } from "@embedpdf/plugin-commands";
export * from "@embedpdf/plugin-commands";
import { ref, watch, toValue, readonly, defineComponent, onMounted, onUnmounted } from "vue";
import { useCapability, usePlugin } from "@embedpdf/core/vue";
const useCommandsCapability = () => useCapability(CommandsPlugin.id);
const useCommandsPlugin = () => usePlugin(CommandsPlugin.id);
const useCommand = (commandId, documentId) => {
  const { provides } = useCommandsCapability();
  const command = ref(null);
  watch(
    [provides, () => toValue(commandId), () => toValue(documentId)],
    ([providesValue, cmdId, docId], _, onCleanup) => {
      if (!providesValue) {
        command.value = null;
        return;
      }
      command.value = providesValue.resolve(cmdId, docId);
      const unsubscribe = providesValue.onCommandStateChanged((event) => {
        if (event.commandId === cmdId && event.documentId === docId) {
          command.value = providesValue.resolve(cmdId, docId);
        }
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return readonly(command);
};
function buildShortcutString(event) {
  const modifiers = [];
  if (event.ctrlKey) modifiers.push("ctrl");
  if (event.shiftKey) modifiers.push("shift");
  if (event.altKey) modifiers.push("alt");
  if (event.metaKey) modifiers.push("meta");
  let key = event.key.toLowerCase();
  if (key === " ") key = "space";
  const isModifier = ["control", "shift", "alt", "meta"].includes(key);
  if (isModifier) {
    return null;
  }
  const parts = [...modifiers, key];
  return parts.sort().join("+");
}
function createKeyDownHandler(commands) {
  return (event) => {
    const composedPath = event.composedPath();
    const target = composedPath[0] || event.target;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      if (event.key !== "Tab") return;
    }
    const shortcut = buildShortcutString(event);
    if (!shortcut) return;
    const command = commands.getCommandByShortcut(shortcut);
    if (!command) return;
    const resolved = commands.resolve(command.id);
    if (resolved.disabled || !resolved.visible) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    commands.execute(command.id, void 0, "keyboard");
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "keyboard-shortcuts",
  setup(__props) {
    const { provides: commands } = useCommandsCapability();
    let cleanup = null;
    onMounted(() => {
      if (!commands.value) return;
      const handleKeyDown = createKeyDownHandler(commands.value);
      document.addEventListener("keydown", handleKeyDown);
      cleanup = () => document.removeEventListener("keydown", handleKeyDown);
    });
    onUnmounted(() => {
      cleanup == null ? void 0 : cleanup();
    });
    return (_ctx, _cache) => {
      return null;
    };
  }
});
const CommandsPluginPackage = createPluginPackage(CommandsPluginPackage$1).addUtility(_sfc_main).build();
export {
  CommandsPluginPackage,
  _sfc_main as KeyboardShortcuts,
  useCommand,
  useCommandsCapability,
  useCommandsPlugin
};
//# sourceMappingURL=index.js.map
