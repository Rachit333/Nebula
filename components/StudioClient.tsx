// "use client";
// import React, { useRef, useState, useEffect } from "react";
// import type ReactType from "react";

// import CodeEditor from "@/components/CodeEditor";
// import LivePreview from "@/components/LivePreview";
// import ModernDrawer from "@/components/ModernDrawer";
// import Toolbar from "@/components/Toolbar";
// import { useProjectStore } from "@/hooks/useProjectStore";
// import {
//   X,
//   Sun,
//   MoonStar,
//   FileText,
//   Laptop,
//   Smartphone,
//   RotateCcw,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useTheme } from "@/components/ThemeProvider";
// import { useSearchParams } from "next/navigation";
// import { SandpackProvider } from "@codesandbox/sandpack-react";
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from "@/components/ui/resizable";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// const FILES = [
//   { name: "App.js", path: "/App.js" },
//   { name: "index.js", path: "/index.js" },
//   { name: "utils.js", path: "/utils.js" },
// ];

// const FILE_CONTENTS: Record<string, string> = {
//   "/App.js": `export default function App() {
//   console.log("Hello CipherStudio!");
//   return <h1>Hello CipherStudio 👋</h1>;
// }`,
//   "/index.js": `import ReactDOM from "react-dom/client";
// import App from "./App";
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);`,
//   "/utils.js": `export function greet(name) {
//   return "Hello " + name;
// }`,
// };

// export default function StudioClient() {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const [activeFile, setActiveFile] = useState<string>("");
//   const files = useProjectStore((s) => s.files);
//   const setFile = useProjectStore((s) => s.setFile);
//   const autosave = useProjectStore((s) => s.autosave);
//   const unsaved = useProjectStore((s) => s.unsaved);
//   const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
//   const discardUnsaved = useProjectStore((s) => s.discardUnsaved);
//   const [openTabs, setOpenTabs] = useState<string[]>([]);
//   const { theme } = useTheme();
//   const [initialized, setInitialized] = useState(false);
//   const previewPanelRef = useRef<any>(null);

//   // Memoize sandpack options to prevent re-renders
//   const sandpackOptions = React.useMemo(
//     () => ({
//       externalResources: [],
//       bundlerURL: undefined,
//     }),
//     []
//   );

//   // Process files for Sandpack - optimized to prevent unnecessary re-renders
//   const sandpackFiles = React.useMemo(() => {
//     const result: Record<string, string> = {};

//     // Ensure we always have App.js and index.js with fallbacks
//     result["/App.js"] =
//       files["/App.js"] ||
//       files["/src/App.js"] ||
//       `export default function App() {
//   console.log("Hello CipherStudio!");
//   return <h1>Hello CipherStudio 👋</h1>;
// }`;

//     result["/index.js"] =
//       files["/index.js"] ||
//       `import ReactDOM from "react-dom/client";
// import App from "./App";
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);`;

//     // Add user files
//     Object.entries(files).forEach(([p, content]) => {
//       const effective = (unsaved && unsaved[p]) ?? content;
//       if (p.startsWith("/src/")) {
//         const target = `/${p.slice("/src/".length)}`;
//         // Skip if we already handled these files
//         if (target !== "/App.js" && target !== "/index.js") {
//           result[target] = effective;
//         }
//       } else if (p !== "/App.js" && p !== "/index.js") {
//         result[p] = effective;
//       }
//     });

//     return result;
//   }, [files, unsaved]);

//   useEffect(() => {
//     if (activeFile) return;
//     const preferred = "/src/App.js";
//     if (files[preferred]) {
//       setActiveFile(preferred);
//       setOpenTabs([preferred]);
//     } else {
//       const first = Object.keys(files)[0];
//       if (first) {
//         setActiveFile(first);
//         setOpenTabs([first]);
//       }
//     }
//   }, [files, activeFile]);

//   const search = useSearchParams();
//   useEffect(() => {
//     const projectId = search.get("project");
//     if (!projectId) return;
//     try {
//       const loaded = useProjectStore.getState().loadProject(projectId);
//       if (loaded) {
//         useProjectStore.getState().saveProject(projectId);
//       }
//     } catch (err) {
//       console.error("Failed to load project", projectId, err);
//     }
//   }, [search]);

//   // Initialize with default files if empty
//   useEffect(() => {
//     const currentFiles = useProjectStore.getState().files;
//     if (Object.keys(currentFiles).length === 0) {
//       Object.entries(FILE_CONTENTS).forEach(([path, content]) => {
//         useProjectStore.getState().setFile(path, content);
//       });
//     }
//     setInitialized(true);
//   }, []);

//   // Add global CSS to handle iframe pointer events during resize
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.id = "resize-handle-fix";
//     style.textContent = `
//       /* Disable pointer events on iframes and potentially problematic elements during resize */
//       [data-panel-group-direction="horizontal"]:active iframe,
//       [data-panel-group-direction="horizontal"]:active .sp-preview-iframe,
//       [data-panel-group-direction="horizontal"]:active .cm-editor,
//       body.is-resizing iframe,
//       body.is-resizing .sp-preview-iframe,
//       body.is-resizing .cm-editor {
//         pointer-events: none !important;
//       }

//       /* Ensure resize handle is always on top and has proper cursor */
//       [data-resize-handle] {
//         z-index: 50;
//         cursor: col-resize !important;
//         touch-action: none;
//       }

//       /* Prevent text selection during resize */
//       body.is-resizing {
//         user-select: none !important;
//         -webkit-user-select: none !important;
//         cursor: col-resize !important;
//       }
//     `;
//     document.head.appendChild(style);

//     // Track mouse state globally
//     let isDragging = false;

//     const handleMouseDown = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       if (target.closest("[data-resize-handle]")) {
//         isDragging = true;
//         document.body.classList.add("is-resizing");
//         document.body.style.cursor = "col-resize";
//       }
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//       if (isDragging && e.buttons !== 1) {
//         // Mouse button released but mousemove still firing
//         isDragging = false;
//         document.body.classList.remove("is-resizing");
//         document.body.style.cursor = "";
//       }
//     };

//     const handleMouseUp = () => {
//       if (isDragging) {
//         isDragging = false;
//         document.body.classList.remove("is-resizing");
//         document.body.style.cursor = "";
//       }
//     };

//     document.addEventListener("mousedown", handleMouseDown, true);
//     document.addEventListener("mousemove", handleMouseMove, true);
//     document.addEventListener("mouseup", handleMouseUp, true);

//     return () => {
//       style.remove();
//       document.removeEventListener("mousedown", handleMouseDown, true);
//       document.removeEventListener("mousemove", handleMouseMove, true);
//       document.removeEventListener("mouseup", handleMouseUp, true);
//       document.body.classList.remove("is-resizing");
//       document.body.style.cursor = "";
//     };
//   }, []);

//   function TabBar({
//     openTabs,
//     active,
//     onSelect,
//     onClose,
//   }: {
//     openTabs: string[];
//     active?: string;
//     onSelect: (p: string) => void;
//     onClose: (p: string) => void;
//   }) {
//     const { theme, toggleTheme } = useTheme();

//     return (
//       <TooltipProvider>
//         <div className="flex items-center border-b border-border bg-muted/30 backdrop-blur-sm">
//           <ScrollArea className="flex-1">
//             <div className="flex items-center px-2 py-1.5 gap-1">
//               {openTabs.map((p) => {
//                 const name = p.split("/").pop() || p;
//                 const hasUnsaved = !!unsaved?.[p];
//                 const isActive = active === p;

//                 return (
//                   <div
//                     key={p}
//                     className={`
//                       group relative flex items-center gap-2 px-3 py-2 rounded-md
//                       transition-all duration-200 ease-in-out
//                       ${
//                         isActive
//                           ? "bg-background shadow-sm border border-border"
//                           : "hover:bg-muted"
//                       }
//                     `}
//                   >
//                     <Tooltip>
//                       <TooltipTrigger asChild>
//                         <button
//                           onClick={() => onSelect(p)}
//                           className="flex items-center gap-2 min-w-0 outline-none"
//                         >
//                           <FileText
//                             className={`w-3.5 h-3.5 flex-shrink-0 ${
//                               isActive
//                                 ? "text-primary"
//                                 : "text-muted-foreground"
//                             }`}
//                           />
//                           <span
//                             className={`text-sm truncate max-w-[120px] ${
//                               isActive
//                                 ? "font-medium text-foreground"
//                                 : "text-muted-foreground"
//                             }`}
//                           >
//                             {name}
//                           </span>
//                           {hasUnsaved && (
//                             <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 animate-pulse" />
//                           )}
//                         </button>
//                       </TooltipTrigger>
//                       <TooltipContent side="bottom" className="text-xs">
//                         <p>{p}</p>
//                         {hasUnsaved && (
//                           <p className="text-yellow-500">Unsaved changes</p>
//                         )}
//                       </TooltipContent>
//                     </Tooltip>

//                     {openTabs.length > 1 && (
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className={`
//                           h-5 w-5 p-0 rounded-sm
//                           opacity-0 group-hover:opacity-100
//                           transition-opacity duration-200
//                           hover:bg-muted-foreground/20
//                           ${isActive ? "opacity-60" : ""}
//                         `}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onClose(p);
//                         }}
//                       >
//                         <X className="h-3.5 w-3.5" />
//                       </Button>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//             <ScrollBar orientation="horizontal" />
//           </ScrollArea>

//           <div className="flex items-center px-2 border-l border-border">
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-8 w-8"
//                   onClick={() => toggleTheme()}
//                 >
//                   {theme === "dark" ? (
//                     <Sun className="h-4 w-4" />
//                   ) : (
//                     <MoonStar className="h-4 w-4" />
//                   )}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="bottom">
//                 <p>Toggle theme</p>
//               </TooltipContent>
//             </Tooltip>
//           </div>
//         </div>
//       </TooltipProvider>
//     );
//   }

//   return (
//     <SandpackProvider
//       template="react"
//       files={sandpackFiles}
//       theme={theme === "dark" ? "dark" : "light"}
//       options={sandpackOptions}
//     >
//       <main className="h-screen flex flex-col bg-background text-foreground">
//         <div className="flex-1" ref={containerRef}>
//           <div className="h-full flex">
//             <Toolbar
//               activeFile={activeFile}
//               onOpen={(p: string) => {
//                 setActiveFile(p);
//                 setOpenTabs((tabs) => (tabs.includes(p) ? tabs : [...tabs, p]));
//                 if (!files[p]) {
//                   const content = FILE_CONTENTS[p] ?? "";
//                   if (content) setFile(p, content);
//                 }
//               }}
//               onRename={(oldP: string, newP: string) => {
//                 useProjectStore.getState().renameFile(oldP, newP);
//                 if (activeFile === oldP) setActiveFile(newP);
//                 // Update open tabs to reflect the rename
//                 setOpenTabs((tabs) => tabs.map((t) => (t === oldP ? newP : t)));
//               }}
//               onDelete={(p: string) => {
//                 useProjectStore.getState().deleteFile(p);
//                 // Close the tab if it's open
//                 setOpenTabs((tabs) => tabs.filter((t) => t !== p));
//                 if (activeFile === p) {
//                   const remaining = openTabs.filter((t) => t !== p);
//                   setActiveFile(remaining[0] ?? "");
//                 }
//               }}
//             />
//             <div className="flex-1 flex flex-col">
//               <TabBar
//                 openTabs={openTabs}
//                 active={activeFile}
//                 onSelect={(p) => setActiveFile(p)}
//                 onClose={(p) => {
//                   const hasUnsaved = !!unsaved?.[p];
//                   if (!autosave && hasUnsaved) {
//                     if (!confirm(`Discard unsaved changes to ${p}?`)) return;
//                     discardUnsaved(p);
//                   } else if (autosave && hasUnsaved) {
//                     commitUnsaved(p);
//                   }
//                   setOpenTabs((t) => t.filter((x) => x !== p));
//                   if (activeFile === p)
//                     setActiveFile((t) => {
//                       const next = openTabs.find((x) => x !== p);
//                       return next ?? "";
//                     });
//                 }}
//               />

//               <div className="flex-1 h-full min-h-0">
//                 {initialized && (
//                   <ResizablePanelGroup
//                     direction="horizontal"
//                     className="h-full w-full"
//                   >
//                     <ResizablePanel defaultSize={40} minSize={0} maxSize={70}>
//                       <div className="h-full border-r border-border bg-background overflow-hidden">
//                         <CodeEditor selectedPath={activeFile ?? undefined} />
//                       </div>
//                     </ResizablePanel>

//                     <ResizableHandle withHandle />

//                     <ResizablePanel
//                       ref={previewPanelRef}
//                       // defaultSize={60} ignored due to resize bug
//                       minSize={30}
//                       maxSize={100}
//                       className="transition-all duration-1000 ease-all"
//                     >
//                       <div className="h-full">
//                         <ModernDrawer>
//                           <button
//                             className="w-7 h-7 flex items-center justify-center hover:color-muted transition"
//                             onClick={() => previewPanelRef.current?.resize(100)}
//                           >
//                             <Laptop className="w-4 h-4" />
//                           </button>
//                           <button className="w-7 h-7 flex items-center justify-center hover:color-muted transition"
//                           onClick={() => previewPanelRef.current?.resize(30)}
//                           >
//                             <Smartphone className="w-4 h-4" />
//                           </button>
//                           <button className="w-7 h-7 flex items-center justify-center hover:color-muted transition"
//                           onClick={() => previewPanelRef.current?.resize(60)}
//                           >
//                             <RotateCcw className="w-4 h-4" />
//                           </button>
//                         </ModernDrawer>
//                         <LivePreview />
//                       </div>
//                     </ResizablePanel>
//                   </ResizablePanelGroup>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </SandpackProvider>
//   );
// }

// -----------------------------------

"use client";
import React, { useRef, useState, useEffect } from "react";
import type ReactType from "react";

import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";
import ModernDrawer from "@/components/ModernDrawer";
import AICodeGenerator from "@/components/AICodeGenerator";
import Toolbar from "@/components/Toolbar";
import { useProjectStore } from "@/hooks/useProjectStore";
import {
  X,
  Sun,
  MoonStar,
  FileText,
  Laptop,
  Smartphone,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useSearchParams } from "next/navigation";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FILES = [
  { name: "App.js", path: "/App.js" },
  { name: "index.js", path: "/index.js" },
  { name: "utils.js", path: "/utils.js" },
];

const FILE_CONTENTS: Record<string, string> = {
  "/App.js": `export default function App() {
  console.log("Hello CipherStudio!");
  return <h1>Hello CipherStudio 👋</h1>;
}`,
  "/index.js": `import ReactDOM from "react-dom/client";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`,
  "/utils.js": `export function greet(name) {
  return "Hello " + name;
}`,
};

export default function StudioClient() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeFile, setActiveFile] = useState<string>("");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const files = useProjectStore((s) => s.files);
  const setFile = useProjectStore((s) => s.setFile);
  const autosave = useProjectStore((s) => s.autosave);
  const unsaved = useProjectStore((s) => s.unsaved);
  const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
  const discardUnsaved = useProjectStore((s) => s.discardUnsaved);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const { theme } = useTheme();
  const [initialized, setInitialized] = useState(false);
  const previewPanelRef = useRef<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentSize, setCurrentSize] = useState(0); // Start from 0 for initial animation
  const animationFrameRef = useRef<number | null>(null);

  const sizeCycle = [100, 60, 30];
  const cycleIndexRef = useRef(0);

  // Memoize sandpack options to prevent re-renders
  const sandpackOptions = React.useMemo(
    () => ({
      externalResources: [],
      bundlerURL: undefined,
    }),
    []
  );

  // Process files for Sandpack - optimized to prevent unnecessary re-renders
  const sandpackFiles = React.useMemo(() => {
    const result: Record<string, string> = {};

    // Ensure we always have App.js and index.js with fallbacks
    result["/App.js"] =
      files["/App.js"] ||
      files["/src/App.js"] ||
      `export default function App() {
  console.log("Hello CipherStudio!");
  return <h1>Hello CipherStudio 👋</h1>;
}`;

    result["/index.js"] =
      files["/index.js"] ||
      `import ReactDOM from "react-dom/client";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`;

    // Add user files
    Object.entries(files).forEach(([p, content]) => {
      const effective = (unsaved && unsaved[p]) ?? content;
      if (p.startsWith("/src/")) {
        const target = `/${p.slice("/src/".length)}`;
        // Skip if we already handled these files
        if (target !== "/App.js" && target !== "/index.js") {
          result[target] = effective;
        }
      } else if (p !== "/App.js" && p !== "/index.js") {
        result[p] = effective;
      }
    });

    return result;
  }, [files, unsaved]);

  useEffect(() => {
    if (activeFile) return;
    const preferred = "/src/App.js";
    if (files[preferred]) {
      setActiveFile(preferred);
      setOpenTabs([preferred]);
    } else {
      const first = Object.keys(files)[0];
      if (first) {
        setActiveFile(first);
        setOpenTabs([first]);
      }
    }
  }, [files, activeFile]);

  const search = useSearchParams();
  useEffect(() => {
    const projectId = search.get("project");
    if (!projectId) return;
    try {
      const loaded = useProjectStore.getState().loadProject(projectId);
      if (loaded) {
        useProjectStore.getState().saveProject(projectId);
      }
    } catch (err) {
      console.error("Failed to load project", projectId, err);
    }
  }, [search]);

  // Initialize with default files if empty
  useEffect(() => {
    const currentFiles = useProjectStore.getState().files;
    if (Object.keys(currentFiles).length === 0) {
      Object.entries(FILE_CONTENTS).forEach(([path, content]) => {
        useProjectStore.getState().setFile(path, content);
      });
    }
    setInitialized(true);

    // Trigger initial animation after a short delay
    setTimeout(() => {
      handleProgrammaticResize(60);
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 1100);
    }, 100);
  }, []);

  // Add global CSS to handle iframe pointer events during resize
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "resize-handle-fix";
    style.textContent = `
      /* Disable pointer events on iframes and potentially problematic elements during resize */
      [data-panel-group-direction="horizontal"]:active iframe,
      [data-panel-group-direction="horizontal"]:active .sp-preview-iframe,
      [data-panel-group-direction="horizontal"]:active .cm-editor,
      body.is-resizing iframe,
      body.is-resizing .sp-preview-iframe,
      body.is-resizing .cm-editor {
        pointer-events: none !important;
      }

      /* Ensure resize handle is always on top and has proper cursor */
      [data-resize-handle] {
        z-index: 50;
        cursor: col-resize !important;
        touch-action: none;
      }

      /* Prevent text selection during resize */
      body.is-resizing {
        user-select: none !important;
        -webkit-user-select: none !important;
        cursor: col-resize !important;
      }
    `;
    document.head.appendChild(style);
    let isDragging = false;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-resize-handle]")) {
        isDragging = true;
        document.body.classList.add("is-resizing");
        document.body.style.cursor = "col-resize";
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && e.buttons !== 1) {
        isDragging = false;
        document.body.classList.remove("is-resizing");
        document.body.style.cursor = "";
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        document.body.classList.remove("is-resizing");
        document.body.style.cursor = "";
      }
    };

    document.addEventListener("mousedown", handleMouseDown, true);
    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("mouseup", handleMouseUp, true);

    return () => {
      style.remove();
      document.removeEventListener("mousedown", handleMouseDown, true);
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("mouseup", handleMouseUp, true);
      document.body.classList.remove("is-resizing");
      document.body.style.cursor = "";
    };
  }, []);

  // Helper function to handle programmatic resize with animation
  const handleProgrammaticResize = (targetSize: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsAnimating(true);

    const startSize = currentSize;
    const startTime = performance.now();
    const duration = 700; // 0.7 seconds

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutQuad
      // const easeInOut = progress < 0.5
      //   ? 2 * progress * progress
      //   : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // easeInOutQuint
      // const easeInOut = progress < 0.5
      //   ? 16 * progress * progress * progress * progress * progress
      //   : 1 - Math.pow(-2 * progress + 2, 5) / 2;

      // easeInOutQuart
      const easeInOut =
        progress < 0.5
          ? 8 * progress * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 4) / 2;

      const newSize = startSize + (targetSize - startSize) * easeInOut;

      if (previewPanelRef.current) {
        previewPanelRef.current.resize(newSize);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentSize(targetSize);
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+. to toggle AI panel / code editor
      if (e.ctrlKey && e.code === "Period") {
        e.preventDefault();
        setShowAIPanel((prev) => !prev);
      }
      // Ctrl+Space to cycle preview sizes
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();

        const nextIndex = (cycleIndexRef.current + 1) % sizeCycle.length;

        cycleIndexRef.current = nextIndex;

        handleProgrammaticResize(sizeCycle[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleProgrammaticResize]);

  useEffect(() => {
    const index = sizeCycle.indexOf(currentSize);
    if (index !== -1) {
      cycleIndexRef.current = index;
    }
  }, [currentSize]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  function TabBar({
    openTabs,
    active,
    onSelect,
    onClose,
  }: {
    openTabs: string[];
    active?: string;
    onSelect: (p: string) => void;
    onClose: (p: string) => void;
  }) {
    const { theme, toggleTheme } = useTheme();

    return (
      <TooltipProvider>
        <div className="flex items-center border-b border-border bg-muted/30 backdrop-blur-sm">
          <ScrollArea className="flex-1">
            <div className="flex items-center px-2 py-1.5 gap-1">
              {openTabs.map((p) => {
                const name = p.split("/").pop() || p;
                const hasUnsaved = !!unsaved?.[p];
                const isActive = active === p;

                return (
                  <div
                    key={p}
                    className={`
                      group relative flex items-center gap-2 px-3 py-2 rounded-md
                      transition-all duration-200 ease-in-out
                      ${
                        isActive
                          ? "bg-background shadow-sm border border-border"
                          : "hover:bg-muted"
                      }
                    `}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onSelect(p)}
                          className="flex items-center gap-2 min-w-0 outline-none"
                        >
                          <FileText
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`text-sm truncate max-w-[120px] ${
                              isActive
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {name}
                          </span>
                          {hasUnsaved && (
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 animate-pulse" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{p}</p>
                        {hasUnsaved && (
                          <p className="text-yellow-500">Unsaved changes</p>
                        )}
                      </TooltipContent>
                    </Tooltip>

                    {openTabs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`
                          h-5 w-5 p-0 rounded-sm
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200
                          hover:bg-muted-foreground/20
                          ${isActive ? "opacity-60" : ""}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose(p);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="flex items-center px-2 border-l border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleTheme()}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <MoonStar className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <SandpackProvider
      template="react"
      files={sandpackFiles}
      theme={theme === "dark" ? "dark" : "light"}
      options={sandpackOptions}
    >
      <main className="h-screen flex flex-col bg-background text-foreground">
        <div className="flex-1" ref={containerRef}>
          <div className="h-full flex">
            <Toolbar
              activeFile={activeFile}
              onOpen={(p: string) => {
                setActiveFile(p);
                setOpenTabs((tabs) => (tabs.includes(p) ? tabs : [...tabs, p]));
                if (!files[p]) {
                  const content = FILE_CONTENTS[p] ?? "";
                  if (content) setFile(p, content);
                }
              }}
              onRename={(oldP: string, newP: string) => {
                useProjectStore.getState().renameFile(oldP, newP);
                if (activeFile === oldP) setActiveFile(newP);
                // Update open tabs to reflect the rename
                setOpenTabs((tabs) => tabs.map((t) => (t === oldP ? newP : t)));
              }}
              onDelete={(p: string) => {
                useProjectStore.getState().deleteFile(p);
                // Close the tab if it's open
                setOpenTabs((tabs) => tabs.filter((t) => t !== p));
                if (activeFile === p) {
                  const remaining = openTabs.filter((t) => t !== p);
                  setActiveFile(remaining[0] ?? "");
                }
              }}
            />
            <div className="flex-1 flex flex-col">
              <TabBar
                openTabs={openTabs}
                active={activeFile}
                onSelect={(p) => setActiveFile(p)}
                onClose={(p) => {
                  const hasUnsaved = !!unsaved?.[p];
                  if (!autosave && hasUnsaved) {
                    if (!confirm(`Discard unsaved changes to ${p}?`)) return;
                    discardUnsaved(p);
                  } else if (autosave && hasUnsaved) {
                    commitUnsaved(p);
                  }
                  setOpenTabs((t) => t.filter((x) => x !== p));
                  if (activeFile === p)
                    setActiveFile((t) => {
                      const next = openTabs.find((x) => x !== p);
                      return next ?? "";
                    });
                }}
              />

              <div className="flex-1 h-full min-h-0">
                {initialized && (
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full w-full"
                  >
                    <ResizablePanel defaultSize={40} minSize={0} maxSize={70}>
                      <div className="h-full border-r border-border bg-background overflow-hidden">
                        <CodeEditor selectedPath={activeFile ?? undefined} />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel
                      ref={previewPanelRef}
                      minSize={isInitialLoad ? 0 : 30}
                      maxSize={100}
                      defaultSize={0}
                      onResize={(size) => {
                        if (!isAnimating && !isInitialLoad) {
                          setCurrentSize(size);
                        }
                      }}
                    >
                      <div className="h-full">
                        <ModernDrawer>
                          <button
                            className="w-7 h-7 flex items-center justify-center hover:text-muted-foreground transition"
                            onClick={() => handleProgrammaticResize(100)}
                          >
                            <Laptop className="w-4 h-4" />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center hover:text-muted-foreground transition"
                            onClick={() => handleProgrammaticResize(30)}
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center hover:text-muted-foreground transition"
                            onClick={() => handleProgrammaticResize(60)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </ModernDrawer>
                        <LivePreview />
                      </div>
                    </ResizablePanel>
                    <AICodeGenerator />
                  </ResizablePanelGroup>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </SandpackProvider>
  );
}
