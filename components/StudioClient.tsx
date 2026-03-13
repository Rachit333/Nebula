"use client";
import React, { useRef, useState, useEffect } from "react";

import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";
import ModernDrawer from "@/components/ModernDrawer";
import AICodeGenerator from "@/components/AICodeGenerator";
import Toolbar from "@/components/Toolbar";
import { useProjectStore } from "@/hooks/useProjectStore";
import { X, Sun, MoonStar, Laptop, Smartphone, RotateCcw, Sparkles } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider";
import { useSearchParams } from "next/navigation";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const FILE_CONTENTS: Record<string, string> = {
  "/App.js": `export default function App() {
  return <h1>Hello Nebula 👋</h1>;
}`,
  "/index.js": `import ReactDOM from "react-dom/client";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`,
  "/utils.js": `export function greet(name) {
  return "Hello " + name;
}`,
};

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({
  openTabs, active, onSelect, onClose, unsaved,
  showAIPanel, onToggleAI,
  onResizePreview,
}: {
  openTabs: string[]; active?: string
  onSelect: (p: string) => void; onClose: (p: string) => void
  unsaved?: Record<string, string> | null
  showAIPanel: boolean; onToggleAI: () => void
  onResizePreview: (size: number) => void
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center border-b border-white/7 bg-[#080a0e]" style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* tabs */}
      <div className="flex-1 flex items-center px-2 py-[6px] gap-1 overflow-x-auto scrollbar-none">
        {openTabs.map((p) => {
          const name = p.split("/").pop() || p
          const hasUnsaved = !!unsaved?.[p]
          const isActive = active === p
          return (
            <div
              key={p}
              className={`group relative flex items-center gap-[6px] px-3 py-[5px] rounded-md cursor-pointer transition-all duration-150 flex-shrink-0 ${isActive
                ? "bg-[#151820] border border-white/10 text-[#f0f2f5]"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              onClick={() => onSelect(p)}
            >
              {hasUnsaved && <span className="w-[5px] h-[5px] rounded-full bg-yellow-400 flex-shrink-0 animate-pulse" />}
              <span className="text-[12px] truncate max-w-[140px]">{name}</span>
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-px" style={{ background: "linear-gradient(90deg, transparent, #c8f04b, transparent)" }} />
              )}
              {openTabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(p) }}
                  className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/80 hover:bg-white/10 flex-shrink-0"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* right-side actions */}
      <div className="flex items-center gap-1 px-2 border-l border-white/7 flex-shrink-0">
        {/* preview size buttons */}
        <button
          onClick={() => onResizePreview(100)}
          title="Full preview"
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] transition-all duration-200"
        >
          <Laptop size={13} />
        </button>
        <button
          onClick={() => onResizePreview(60)}
          title="Split preview"
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] transition-all duration-200"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={() => onResizePreview(30)}
          title="Mobile preview"
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] transition-all duration-200"
        >
          <Smartphone size={13} />
        </button>

        <div className="w-px h-4 bg-white/7 mx-1" />

        {/* AI toggle */}
        <button
          onClick={onToggleAI}
          title="Toggle AI panel"
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 ${showAIPanel
            ? "text-[#c8f04b] bg-[rgba(200,240,75,0.12)] border border-[rgba(200,240,75,0.2)]"
            : "text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)]"
            }`}
        >
          <Sparkles size={13} />
        </button>

        <div className="w-px h-4 bg-white/7 mx-1" />

        {/* theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] transition-all duration-200"
        >
          {theme === "dark" ? <Sun size={13} /> : <MoonStar size={13} />}
        </button>
      </div>
    </div>
  )
}

// ─── Studio ───────────────────────────────────────────────────────────────────

export default function StudioClient() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeFile, setActiveFile] = useState<string>("");
  const files = useProjectStore((s) => s.files);
  const setFile = useProjectStore((s) => s.setFile);
  const unsaved = useProjectStore((s) => s.unsaved);
  const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const { theme } = useTheme();
  const [initialized, setInitialized] = useState(false);
  const previewPanelRef = useRef<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentSize, setCurrentSize] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const cycleIndexRef = useRef(0);
  const sizeCycle = [100, 60, 30];
  const [showAIPanel, setShowAIPanel] = useState(false)

  const sandpackOptions = React.useMemo(() => ({ externalResources: [], bundlerURL: undefined }), []);

  const sandpackFiles = React.useMemo(() => {
    const result: Record<string, string> = {};
    result["/App.js"] =
      files["/App.js"] || files["/src/App.js"] || FILE_CONTENTS["/App.js"];
    result["/index.js"] = files["/index.js"] || FILE_CONTENTS["/index.js"];
    Object.entries(files).forEach(([p, content]) => {
      const effective = unsaved?.[p] ?? content;
      if (p.startsWith("/src/")) {
        const target = `/${p.slice("/src/".length)}`;
        if (target !== "/App.js" && target !== "/index.js") result[target] = effective;
      } else if (p !== "/App.js" && p !== "/index.js") {
        result[p] = effective;
      }
    });
    return result;
  }, [files, unsaved]);

  // open first file
  useEffect(() => {
    if (activeFile) return;
    const preferred = "/src/App.js";
    const first = files[preferred] ? preferred : Object.keys(files)[0];
    if (first) { setActiveFile(first); setOpenTabs([first]); }
  }, [files, activeFile]);

  const search = useSearchParams();

  const handleProgrammaticResize = React.useCallback((targetSize: number) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsAnimating(true);
    const startSize = currentSize;
    const startTime = performance.now();
    const duration = 700;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeInOut = progress < 0.5
        ? 8 * progress ** 4
        : 1 - (-2 * progress + 2) ** 4 / 2;
      previewPanelRef.current?.resize(startSize + (targetSize - startSize) * easeInOut);
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentSize(targetSize);
        animationFrameRef.current = null;
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [currentSize]);

  // load project from URL
  useEffect(() => {
    const projectId = search.get("project");
    if (projectId) {
      try {
        useProjectStore.getState().loadProject(projectId);
        useProjectStore.getState().saveProject(projectId);
      } catch { }
      setInitialized(true);
      setTimeout(() => { handleProgrammaticResize(60); setTimeout(() => setIsInitialLoad(false), 1100); }, 100);
    }
  }, [search]);

  // init defaults
  useEffect(() => {
    if (search.get("project")) return;
    const currentFiles = useProjectStore.getState().files;
    if (Object.keys(currentFiles).length === 0) {
      Object.entries(FILE_CONTENTS).forEach(([p, c]) => useProjectStore.getState().setFile(p, c));
    }
    setInitialized(true);
    setTimeout(() => { handleProgrammaticResize(60); setTimeout(() => setIsInitialLoad(false), 1100); }, 100);
  }, [search]);

  // auto-save
  useEffect(() => {
    const projectId = useProjectStore.getState().currentProjectId;
    if (!projectId || !files || Object.keys(files).length === 0) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(`nebula:project:${projectId}`, JSON.stringify({ files, unsaved: {}, savedAt: new Date().toISOString() }));
      } catch { }
    }, 2000);
    return () => clearTimeout(t);
  }, [files]);

  // resize cursor fix
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      body.is-resizing iframe, body.is-resizing .cm-editor { pointer-events: none !important; }
      [data-resize-handle] { z-index: 50; cursor: col-resize !important; touch-action: none; }
      body.is-resizing { user-select: none !important; cursor: col-resize !important; }
    `;
    document.head.appendChild(style);
    let dragging = false;
    const down = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("[data-resize-handle]")) { dragging = true; document.body.classList.add("is-resizing"); } };
    const move = (e: MouseEvent) => { if (dragging && e.buttons !== 1) { dragging = false; document.body.classList.remove("is-resizing"); } };
    const up = () => { if (dragging) { dragging = false; document.body.classList.remove("is-resizing"); } };
    document.addEventListener("mousedown", down, true);
    document.addEventListener("mousemove", move, true);
    document.addEventListener("mouseup", up, true);
    return () => { style.remove(); document.removeEventListener("mousedown", down, true); document.removeEventListener("mousemove", move, true); document.removeEventListener("mouseup", up, true); document.body.classList.remove("is-resizing"); };
  }, []);

  useEffect(() => {
    const idx = sizeCycle.indexOf(currentSize);
    if (idx !== -1) cycleIndexRef.current = idx;
  }, [currentSize]);

  useEffect(() => () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
    body.is-resizing * { pointer-events: none !important; }
    body.is-resizing { pointer-events: all !important; cursor: col-resize !important; user-select: none !important; }
    [data-resize-handle] { z-index: 50 !important; cursor: col-resize !important; touch-action: none; }
  `;
    document.head.appendChild(style);

    let dragging = false;

    const down = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-resize-handle]")) {
        dragging = true;
        document.body.classList.add("is-resizing");
      }
    };
    const move = (e: MouseEvent) => {
      if (dragging && e.buttons !== 1) {
        dragging = false;
        document.body.classList.remove("is-resizing");
      }
    };
    const up = () => {
      if (dragging) {
        dragging = false;
        document.body.classList.remove("is-resizing");
      }
    };

    document.addEventListener("mousedown", down, true);
    document.addEventListener("mousemove", move, true);
    document.addEventListener("mouseup", up, true);

    return () => {
      style.remove();
      document.removeEventListener("mousedown", down, true);
      document.removeEventListener("mousemove", move, true);
      document.removeEventListener("mouseup", up, true);
      document.body.classList.remove("is-resizing");
    };
  }, []);

  return (
    <SandpackProvider template="react" files={sandpackFiles} theme={theme === "dark" ? "dark" : "light"} options={sandpackOptions}>
      <main className="h-screen flex flex-col bg-[#080a0e] text-[#f0f2f5]" style={{ fontFamily: "'DM Mono', monospace" }}>
        <div className="flex-1 flex flex-col min-h-0" ref={containerRef}>
          <div className="h-full flex min-h-0">

            {/* sidebar */}
            <Toolbar
              activeFile={activeFile}
              onOpen={(p: string) => {
                setActiveFile(p);
                setOpenTabs((tabs) => tabs.includes(p) ? tabs : [...tabs, p]);
                if (!files[p]) { const c = FILE_CONTENTS[p] ?? ""; if (c) setFile(p, c); }
              }}
              onRename={(oldP: string, newP: string) => {
                useProjectStore.getState().renameFile(oldP, newP);
                if (activeFile === oldP) setActiveFile(newP);
                setOpenTabs((tabs) => tabs.map((t) => t === oldP ? newP : t));
              }}
              onDelete={(p: string) => {
                useProjectStore.getState().deleteFile(p);
                setOpenTabs((tabs) => tabs.filter((t) => t !== p));
                if (activeFile === p) {
                  const remaining = openTabs.filter((t) => t !== p);
                  setActiveFile(remaining[0] ?? "");
                }
              }}
            />

            {/* main area */}
            <div className="flex-1 flex flex-col min-w-0">
              <TabBar
                openTabs={openTabs}
                active={activeFile}
                unsaved={unsaved}
                showAIPanel={showAIPanel}
                onToggleAI={() => setShowAIPanel((v) => !v)}
                onResizePreview={handleProgrammaticResize}
                onSelect={(p) => setActiveFile(p)}
                onClose={(p) => {
                  if (unsaved?.[p]) commitUnsaved(p)
                  setOpenTabs((t) => t.filter((x) => x !== p))
                  if (activeFile === p) {
                    const next = openTabs.find((x) => x !== p)
                    setActiveFile(next ?? "")
                  }
                }}
              />

              <div className="flex-1 min-h-0">
                {initialized && (
                  <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                    {showAIPanel && (
                      <>
                        <ResizablePanel defaultSize={25} minSize={18} maxSize={40}>
                          <AICodeGenerator onClose={() => setShowAIPanel(false)} />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                      </>
                    )}

                    <ResizablePanel defaultSize={40} minSize={0} maxSize={70}>
                      <div className="h-full border-r border-white/7 bg-[#080a0e] overflow-hidden">
                        <CodeEditor selectedPath={activeFile || undefined} />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel
                      ref={previewPanelRef}
                      minSize={isInitialLoad ? 0 : 30}
                      maxSize={showAIPanel ? 60 : 100}
                      defaultSize={0}
                      onResize={(size) => { if (!isAnimating && !isInitialLoad) setCurrentSize(size) }}
                    >
                      <div className="h-full relative">
                        {/* <ModernDrawer>
                          <button className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] rounded-md transition-all" onClick={() => handleProgrammaticResize(100)} title="Full width">
                            <Laptop size={13} />
                          </button>
                          <button className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] rounded-md transition-all" onClick={() => handleProgrammaticResize(30)} title="Mobile">
                            <Smartphone size={13} />
                          </button>
                          <button className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] rounded-md transition-all" onClick={() => handleProgrammaticResize(60)} title="Reset">
                            <RotateCcw size={13} />
                          </button>
                        </ModernDrawer> */}
                        <LivePreview />
                      </div>
                    </ResizablePanel>
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