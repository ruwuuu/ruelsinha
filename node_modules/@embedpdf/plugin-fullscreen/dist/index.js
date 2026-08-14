import { BasePlugin, createBehaviorEmitter, createEmitter } from "@embedpdf/core";
const FULLSCREEN_PLUGIN_ID = "fullscreen";
const manifest = {
  id: FULLSCREEN_PLUGIN_ID,
  name: "Fullscreen Plugin",
  version: "1.0.0",
  provides: ["fullscreen"],
  requires: [],
  optional: [],
  defaultConfig: {}
};
const SET_FULLSCREEN = "SET_FULLSCREEN";
function setFullscreen(payload) {
  return { type: SET_FULLSCREEN, payload };
}
const _FullscreenPlugin = class _FullscreenPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.onStateChange$ = createBehaviorEmitter();
    this.fullscreenRequest$ = createEmitter();
    this.config = config;
  }
  async initialize(_) {
  }
  buildCapability() {
    return {
      isFullscreen: () => this.state.isFullscreen,
      enableFullscreen: (targetElement) => this.enableFullscreen(targetElement),
      exitFullscreen: () => this.exitFullscreen(),
      toggleFullscreen: (targetElement) => this.toggleFullscreen(targetElement),
      onRequest: this.fullscreenRequest$.on,
      onStateChange: this.onStateChange$.on
    };
  }
  getTargetSelector() {
    return this.currentTargetElement ?? this.config.targetElement;
  }
  toggleFullscreen(targetElement) {
    if (this.state.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enableFullscreen(targetElement);
    }
  }
  enableFullscreen(targetElement) {
    this.currentTargetElement = targetElement ?? this.config.targetElement;
    this.fullscreenRequest$.emit({
      action: "enter",
      targetElement: this.currentTargetElement
    });
  }
  exitFullscreen() {
    this.fullscreenRequest$.emit({
      action: "exit"
    });
    this.currentTargetElement = void 0;
  }
  onStoreUpdated(_, newState) {
    this.onStateChange$.emit(newState);
  }
  setFullscreenState(isFullscreen) {
    this.dispatch(setFullscreen(isFullscreen));
  }
  async destroy() {
    this.fullscreenRequest$.clear();
    super.destroy();
  }
};
_FullscreenPlugin.id = "fullscreen";
let FullscreenPlugin = _FullscreenPlugin;
const initialState = {
  isFullscreen: false
};
const reducer = (state, action) => {
  switch (action.type) {
    case SET_FULLSCREEN:
      return { ...state, isFullscreen: action.payload };
    default:
      return state;
  }
};
const FullscreenPluginPackage = {
  manifest,
  create: (registry, config) => new FullscreenPlugin(FULLSCREEN_PLUGIN_ID, registry, config),
  reducer,
  initialState
};
export {
  FULLSCREEN_PLUGIN_ID,
  FullscreenPlugin,
  FullscreenPluginPackage,
  SET_FULLSCREEN,
  initialState,
  manifest,
  setFullscreen
};
//# sourceMappingURL=index.js.map
