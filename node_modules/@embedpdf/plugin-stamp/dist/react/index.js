import { createPluginPackage } from "@embedpdf/core";
import { StampPlugin, StampPluginPackage as StampPluginPackage$1 } from "@embedpdf/plugin-stamp";
export * from "@embedpdf/plugin-stamp";
import { useCapability, usePlugin } from "@embedpdf/core/react";
import { useState, useEffect, useRef } from "react";
import { jsx } from "react/jsx-runtime";
import { ignore, PdfErrorCode } from "@embedpdf/models";
const useStampPlugin = () => usePlugin(StampPlugin.id);
const useStampCapability = () => useCapability(StampPlugin.id);
const useStampLibraries = () => {
  const { provides } = useStampCapability();
  const [libraries, setLibraries] = useState((provides == null ? void 0 : provides.getLibraries()) ?? []);
  useEffect(() => {
    if (!provides) return;
    setLibraries(provides.getLibraries());
    return provides.onLibraryChange((libs) => {
      setLibraries(libs);
    });
  }, [provides]);
  return { libraries, provides };
};
const useStampsByCategory = (category) => {
  const { provides } = useStampCapability();
  const [stamps, setStamps] = useState([]);
  useEffect(() => {
    if (!provides) return;
    setStamps(provides.getStampsByCategory(category));
    return provides.onLibraryChange(() => {
      setStamps(provides.getStampsByCategory(category));
    });
  }, [provides, category]);
  return stamps;
};
const useStampsByLibrary = (libraryId, category) => {
  const { provides } = useStampCapability();
  const [stamps, setStamps] = useState([]);
  useEffect(() => {
    if (!provides) return;
    const derive = () => {
      var _a, _b;
      const libraries = provides.getLibraries();
      const results = [];
      for (const library of libraries) {
        if (libraryId && libraryId !== "all" && library.id !== libraryId) continue;
        for (const stamp of library.stamps) {
          if (category) {
            const libraryMatches = ((_a = library.categories) == null ? void 0 : _a.includes(category)) ?? false;
            const stampMatches = ((_b = stamp.categories) == null ? void 0 : _b.includes(category)) ?? false;
            if (!libraryMatches && !stampMatches) continue;
          }
          results.push({ library, stamp });
        }
      }
      setStamps(results);
    };
    derive();
    return provides.onLibraryChange(derive);
  }, [provides, libraryId, category]);
  return stamps;
};
const useActiveStamp = (documentId) => {
  const { provides: stamp } = useStampCapability();
  const [activeStamp, setActiveStamp] = useState(null);
  useEffect(() => {
    if (!stamp) return;
    const scope = stamp.forDocument(documentId);
    setActiveStamp(scope.getActiveStamp());
    return scope.onActiveStampChange(setActiveStamp);
  }, [stamp, documentId]);
  return activeStamp;
};
function StampImg({ libraryId, pageIndex, width, dpr, style, ...props }) {
  const { provides } = useStampCapability();
  const [url, setUrl] = useState();
  const urlRef = useRef(null);
  useEffect(() => {
    if (!provides) return;
    const task = provides.renderStamp(libraryId, pageIndex, width, dpr ?? window.devicePixelRatio);
    task.wait((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      urlRef.current = objectUrl;
      setUrl(objectUrl);
    }, ignore);
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      } else {
        task.abort({
          code: PdfErrorCode.Cancelled,
          message: "canceled stamp render task"
        });
      }
    };
  }, [provides, libraryId, pageIndex, width, dpr]);
  const handleImageLoad = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };
  return url ? /* @__PURE__ */ jsx("img", { src: url, onLoad: handleImageLoad, style, ...props }) : null;
}
const StampPluginPackage = createPluginPackage(StampPluginPackage$1).build();
export {
  StampImg,
  StampPluginPackage,
  useActiveStamp,
  useStampCapability,
  useStampLibraries,
  useStampPlugin,
  useStampsByCategory,
  useStampsByLibrary
};
//# sourceMappingURL=index.js.map
