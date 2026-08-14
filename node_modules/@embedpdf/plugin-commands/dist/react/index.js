import { createPluginPackage } from "@embedpdf/core";
import { CommandsPlugin, CommandsPluginPackage as CommandsPluginPackage$1 } from "@embedpdf/plugin-commands";
export * from "@embedpdf/plugin-commands";
import { useState, useEffect } from "react";
import { useCapability, usePlugin } from "@embedpdf/core/react";
const useCommandsCapability = () => useCapability(CommandsPlugin.id);
const useCommandsPlugin = () => usePlugin(CommandsPlugin.id);
const useCommand = (commandId, documentId) => {
  const { provides } = useCommandsCapability();
  const [command, setCommand] = useState(
    () => provides ? provides.resolve(commandId, documentId) : null
  );
  useEffect(() => {
    if (!provides) {
      setCommand(null);
      return;
    }
    setCommand(provides.resolve(commandId, documentId));
    const unsubscribe = provides.onCommandStateChanged((event) => {
      if (event.commandId === commandId && event.documentId === documentId) {
        setCommand(provides.resolve(commandId, documentId));
      }
    });
    return unsubscribe;
  }, [provides, commandId, documentId]);
  return command;
};
const useCommandExecutor = (documentId) => {
  const { provides } = useCommandsCapability();
  return (commandId) => {
    if (provides) {
      provides.execute(commandId, documentId, "ui");
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
function KeyboardShortcuts() {
  const { provides: commands } = useCommandsCapability();
  useEffect(() => {
    if (!commands) return;
    const handleKeyDown = createKeyDownHandler(commands);
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commands]);
  return null;
}
const CommandsPluginPackage = createPluginPackage(CommandsPluginPackage$1).addUtility(KeyboardShortcuts).build();
export {
  CommandsPluginPackage,
  KeyboardShortcuts,
  useCommand,
  useCommandExecutor,
  useCommandsCapability,
  useCommandsPlugin
};
//# sourceMappingURL=index.js.map
