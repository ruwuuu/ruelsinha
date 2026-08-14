import { createPluginPackage } from "@embedpdf/core";
import { CommandsPlugin, CommandsPluginPackage as CommandsPluginPackage$1 } from "@embedpdf/plugin-commands";
export * from "@embedpdf/plugin-commands";
import "svelte/internal/disclose-version";
import "svelte/internal/flags/legacy";
import * as $ from "svelte/internal/client";
import { onMount } from "svelte";
import { useCapability, usePlugin } from "@embedpdf/core/svelte";
const useCommandsCapability = () => useCapability(CommandsPlugin.id);
const useCommandsPlugin = () => usePlugin(CommandsPlugin.id);
const useCommand = (getCommandId, getDocumentId) => {
  const capability = useCommandsCapability();
  let command = $.state(null);
  const commandId = $.derived(getCommandId);
  const documentId = $.derived(getDocumentId);
  $.user_effect(() => {
    const provides = capability.provides;
    const cmdId = $.get(commandId);
    const docId = $.get(documentId);
    if (!provides || !cmdId || !docId) {
      $.set(command, null);
      return;
    }
    $.set(command, provides.resolve(cmdId, docId), true);
    return provides.onCommandStateChanged((event) => {
      if (event.commandId === cmdId && event.documentId === docId) {
        $.set(command, provides.resolve(cmdId, docId), true);
      }
    });
  });
  return {
    get current() {
      return $.get(command);
    }
  };
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
function KeyboardShortcuts($$anchor, $$props) {
  $.push($$props, false);
  const commandsCapability = useCommandsCapability();
  onMount(() => {
    if (!commandsCapability.provides) return;
    const handleKeyDown = createKeyDownHandler(commandsCapability.provides);
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });
  $.init();
  $.pop();
}
const CommandsPluginPackage = createPluginPackage(CommandsPluginPackage$1).addUtility(KeyboardShortcuts).build();
export {
  CommandsPluginPackage,
  KeyboardShortcuts,
  useCommand,
  useCommandsCapability,
  useCommandsPlugin
};
//# sourceMappingURL=index.js.map
