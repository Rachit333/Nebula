// "use client";
// import React, { useRef, useState, useEffect, useCallback } from "react";

// import CodeEditor   from "@/components/CodeEditor";
// import LivePreview  from "@/components/LivePreview";
// import AICodeGenerator from "@/components/AICodeGenerator";
// import Toolbar      from "@/components/Toolbar";
// import { useProjectStore } from "@/hooks/useProjectStore";
// import { X, Columns2, Maximize2, Smartphone, Sparkles } from "lucide-react";
// import { useSearchParams } from "next/navigation";
// import { SandpackProvider } from "@codesandbox/sandpack-react";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// // ── Shared cream palette (mirrors Toolbar + AICodeGenerator) ─────────────────
// const BASE    = "#faf0e6";
// const CARD    = "#fff8f0";
// const BORDER  = "#e8ddd2";
// const MUTED   = "#b8a898";
// const TEXT    = "#2a1f14";
// const SUBTEXT = "#7a6a5a";
// const MONO    = { fontFamily: "'DM Mono', monospace" } as const;

// // ── Default file contents ─────────────────────────────────────────────────────
// const FILE_CONTENTS: Record<string, string> = {
//   "/App.js": `export default function App() {
//   return <h1>Hello Nebula 👋</h1>;
// }`,
//   "/index.js": `import ReactDOM from "react-dom/client";
// import App from "./App";
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);`,
//   "/utils.js": `export function greet(name) {
//   return "Hello " + name;
// }`,
// };

// // ── Tiny file-extension color dot ─────────────────────────────────────────────
// function ExtDot({ name }: { name: string }) {
//   const ext = name.split(".").pop()?.toLowerCase() ?? "";
//   const colors: Record<string, string> = {
//     js: "#a07020", jsx: "#a07020",
//     ts: "#3a6890", tsx: "#3a6890",
//     css: "#5a78a0", scss: "#904870",
//     html: "#904828", json: "#a06820",
//     md: MUTED,
//   };
//   const color = colors[ext] ?? MUTED;
//   return (
//     <span style={{
//       width: 6, height: 6, borderRadius: "50%",
//       background: color, flexShrink: 0, display: "inline-block",
//     }} />
//   );
// }

// // ── Tab bar ───────────────────────────────────────────────────────────────────
// interface TabBarProps {
//   openTabs: string[];
//   active?: string;
//   onSelect: (p: string) => void;
//   onClose: (p: string) => void;
//   unsaved?: Record<string, string> | null;
//   showAIPanel: boolean;
//   onToggleAI: () => void;
//   onResizePreview: (size: number) => void;
// }

// function TabBar({ openTabs, active, onSelect, onClose, unsaved, showAIPanel, onToggleAI, onResizePreview }: TabBarProps) {
//   return (
//     <div
//       style={{
//         display: "flex", alignItems: "center",
//         borderBottom: `1px solid ${BORDER}`,
//         background: CARD,
//         flexShrink: 0,
//         ...MONO,
//       }}
//     >
//       {/* ── Tab list ── */}
//       <div style={{
//         flex: 1, display: "flex", alignItems: "center",
//         padding: "0 8px", gap: 2,
//         overflowX: "auto", scrollbarWidth: "none",
//       }}>
//         {openTabs.length === 0 && (
//           <span style={{ fontSize: 11, color: MUTED, padding: "0 8px" }}>No files open</span>
//         )}
//         {openTabs.map((p) => {
//           const name     = p.split("/").pop() || p;
//           const isActive = active === p;
//           const isDirty  = !!unsaved?.[p];

//           return (
//             <div
//               key={p}
//               onClick={() => onSelect(p)}
//               style={{
//                 position: "relative",
//                 display: "flex", alignItems: "center", gap: 6,
//                 padding: "7px 10px",
//                 borderRadius: "6px 6px 0 0",
//                 cursor: "pointer", flexShrink: 0,
//                 fontSize: 12,
//                 background: isActive ? BASE : "transparent",
//                 color: isActive ? TEXT : SUBTEXT,
//                 borderTop:    isActive ? `1px solid ${BORDER}` : "1px solid transparent",
//                 borderLeft:   isActive ? `1px solid ${BORDER}` : "1px solid transparent",
//                 borderRight:  isActive ? `1px solid ${BORDER}` : "1px solid transparent",
//                 borderBottom: isActive ? `1px solid ${BASE}`   : "1px solid transparent",
//                 marginBottom: isActive ? -1 : 0,
//                 transition: "color 0.12s, background 0.12s",
//                 userSelect: "none",
//               }}
//               onMouseOver={(e) => { if (!isActive) e.currentTarget.style.color = TEXT; }}
//               onMouseOut={(e)  => { if (!isActive) e.currentTarget.style.color = SUBTEXT; }}
//             >
//               <ExtDot name={name} />

//               <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                 {name}
//               </span>

//               {/* dirty indicator */}
//               {isDirty && (
//                 <span style={{
//                   width: 5, height: 5, borderRadius: "50%",
//                   background: "#a07020", flexShrink: 0,
//                 }} />
//               )}

//               {/* close button — only when >1 tab */}
//               {openTabs.length > 1 && (
//                 <button
//                   onClick={(e) => { e.stopPropagation(); onClose(p); }}
//                   style={{
//                     width: 14, height: 14, borderRadius: 4, border: "none",
//                     background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
//                     color: MUTED, cursor: "pointer", padding: 0, flexShrink: 0,
//                     opacity: 0, transition: "opacity 0.12s, color 0.12s",
//                   }}
//                   className="tab-close-btn"
//                   onMouseOver={(e) => { e.currentTarget.style.color = TEXT; }}
//                   onMouseOut={(e)  => { e.currentTarget.style.color = MUTED; }}
//                 >
//                   <X size={10} />
//                 </button>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* ── Right actions ── */}
//       <div style={{
//         display: "flex", alignItems: "center", gap: 2,
//         padding: "0 10px",
//         borderLeft: `1px solid ${BORDER}`,
//         flexShrink: 0,
//       }}>
//         {/* Preview size presets */}
//         {([ 
//           { icon: <Maximize2 size={12} />,  size: 100, title: "Full preview"   },
//           { icon: <Columns2  size={12} />,  size: 60,  title: "Split view"     },
//           { icon: <Smartphone size={12} />, size: 30,  title: "Mobile preview" },
//         ] as const).map(({ icon, size, title }) => (
//           <IconBtn key={size} title={title} onClick={() => onResizePreview(size)}>
//             {icon}
//           </IconBtn>
//         ))}

//         <Divider />

//         {/* AI toggle */}
//         <button
//           onClick={onToggleAI}
//           title="Toggle AI panel"
//           style={{
//             width: 28, height: 28, borderRadius: 7, border: "none",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             cursor: "pointer", transition: "all 0.15s",
//             background: showAIPanel ? "rgba(42,31,20,0.10)" : "transparent",
//             color:      showAIPanel ? TEXT : MUTED,
//             boxShadow:  showAIPanel ? `inset 0 0 0 1px ${BORDER}` : "none",
//           }}
//           onMouseOver={(e) => { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = "rgba(42,31,20,0.07)"; }}
//           onMouseOut={(e)  => {
//             e.currentTarget.style.color      = showAIPanel ? TEXT : MUTED;
//             e.currentTarget.style.background = showAIPanel ? "rgba(42,31,20,0.10)" : "transparent";
//           }}
//         >
//           <Sparkles size={13} />
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Small shared sub-components ───────────────────────────────────────────────
// function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
//   return (
//     <button
//       title={title}
//       onClick={onClick}
//       style={{
//         width: 28, height: 28, borderRadius: 7, border: "none",
//         background: "transparent",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         color: MUTED, cursor: "pointer", transition: "color 0.15s, background 0.15s",
//       }}
//       onMouseOver={(e) => { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = "rgba(42,31,20,0.07)"; }}
//       onMouseOut={(e)  => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}
//     >
//       {children}
//     </button>
//   );
// }

// function Divider() {
//   return <div style={{ width: 1, height: 16, background: BORDER, margin: "0 4px", flexShrink: 0 }} />;
// }

// // ── Studio ────────────────────────────────────────────────────────────────────
// export default function StudioClient() {
//   const containerRef      = useRef<HTMLDivElement | null>(null);
//   const previewPanelRef   = useRef<any>(null);
//   const animationFrameRef = useRef<number | null>(null);
//   const cycleIndexRef     = useRef(0);
//   const sizeCycle         = [100, 60, 30];

//   const [activeFile,    setActiveFile]    = useState<string>("");
//   const [openTabs,      setOpenTabs]      = useState<string[]>([]);
//   const [initialized,   setInitialized]   = useState(false);
//   const [isAnimating,   setIsAnimating]   = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [currentSize,   setCurrentSize]   = useState(0);
//   const [showAIPanel,   setShowAIPanel]   = useState(false);

//   const files        = useProjectStore((s) => s.files);
//   const setFile      = useProjectStore((s) => s.setFile);
//   const unsaved      = useProjectStore((s) => s.unsaved);
//   const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
//   const search       = useSearchParams();

//   // ── Animated resize ──
//   const handleProgrammaticResize = useCallback((targetSize: number) => {
//     if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
//     setIsAnimating(true);
//     const startSize = currentSize;
//     const startTime = performance.now();
//     const duration  = 700;
//     const animate   = (now: number) => {
//       const progress   = Math.min((now - startTime) / duration, 1);
//       const eased      = progress < 0.5
//         ? 8 * progress ** 4
//         : 1 - (-2 * progress + 2) ** 4 / 2;
//       previewPanelRef.current?.resize(startSize + (targetSize - startSize) * eased);
//       if (progress < 1) {
//         animationFrameRef.current = requestAnimationFrame(animate);
//       } else {
//         setIsAnimating(false);
//         setCurrentSize(targetSize);
//         animationFrameRef.current = null;
//       }
//     };
//     animationFrameRef.current = requestAnimationFrame(animate);
//   }, [currentSize]);

//   // ── Open first file on mount ──
//   useEffect(() => {
//     if (activeFile) return;
//     const preferred = "/src/App.js";
//     const first = files[preferred] ? preferred : Object.keys(files)[0];
//     if (first) { setActiveFile(first); setOpenTabs([first]); }
//   }, [files, activeFile]);

//   // ── Load project from URL ──
//   useEffect(() => {
//     const projectId = search.get("project");
//     if (projectId) {
//       try {
//         useProjectStore.getState().loadProject(projectId);
//         useProjectStore.getState().saveProject(projectId);
//       } catch {}
//       setInitialized(true);
//       setTimeout(() => { handleProgrammaticResize(60); setTimeout(() => setIsInitialLoad(false), 1100); }, 100);
//     }
//   }, [search]);

//   // ── Init defaults ──
//   useEffect(() => {
//     if (search.get("project")) return;
//     const current = useProjectStore.getState().files;
//     if (Object.keys(current).length === 0) {
//       Object.entries(FILE_CONTENTS).forEach(([p, c]) => useProjectStore.getState().setFile(p, c));
//     }
//     setInitialized(true);
//     setTimeout(() => { handleProgrammaticResize(60); setTimeout(() => setIsInitialLoad(false), 1100); }, 100);
//   }, [search]);

//   // ── Auto-save ──
//   useEffect(() => {
//     const projectId = useProjectStore.getState().currentProjectId;
//     if (!projectId || !files || Object.keys(files).length === 0) return;
//     const t = setTimeout(() => {
//       try {
//         localStorage.setItem(
//           `nebula:project:${projectId}`,
//           JSON.stringify({ files, unsaved: {}, savedAt: new Date().toISOString() }),
//         );
//       } catch {}
//     }, 2000);
//     return () => clearTimeout(t);
//   }, [files]);

//   // ── Resize cursor fix ──
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.textContent = `
//       body.is-resizing iframe, body.is-resizing .cm-editor { pointer-events: none !important; }
//       body.is-resizing * { pointer-events: none !important; }
//       body.is-resizing { pointer-events: all !important; cursor: col-resize !important; user-select: none !important; }
//       [data-resize-handle] { z-index: 50 !important; cursor: col-resize !important; touch-action: none; }
//       /* show tab close btn on tab hover */
//       div:hover > .tab-close-btn { opacity: 1 !important; }
//     `;
//     document.head.appendChild(style);
//     let dragging = false;
//     const down = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("[data-resize-handle]")) { dragging = true; document.body.classList.add("is-resizing"); } };
//     const move = (e: MouseEvent) => { if (dragging && e.buttons !== 1) { dragging = false; document.body.classList.remove("is-resizing"); } };
//     const up   = () => { if (dragging) { dragging = false; document.body.classList.remove("is-resizing"); } };
//     document.addEventListener("mousedown", down, true);
//     document.addEventListener("mousemove", move, true);
//     document.addEventListener("mouseup",   up,   true);
//     return () => {
//       style.remove();
//       document.removeEventListener("mousedown", down, true);
//       document.removeEventListener("mousemove", move, true);
//       document.removeEventListener("mouseup",   up,   true);
//       document.body.classList.remove("is-resizing");
//     };
//   }, []);

//   // ── Sync size cycle index ──
//   useEffect(() => {
//     const idx = sizeCycle.indexOf(currentSize);
//     if (idx !== -1) cycleIndexRef.current = idx;
//   }, [currentSize]);

//   useEffect(() => () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); }, []);

//   // ── Sandpack files ──
//   const sandpackFiles = React.useMemo(() => {
//     const result: Record<string, string> = {};
//     result["/App.js"]   = files["/App.js"] || files["/src/App.js"] || FILE_CONTENTS["/App.js"];
//     result["/index.js"] = files["/index.js"] || FILE_CONTENTS["/index.js"];
//     Object.entries(files).forEach(([p, content]) => {
//       const effective = unsaved?.[p] ?? content;
//       if (p.startsWith("/src/")) {
//         const target = `/${p.slice("/src/".length)}`;
//         if (target !== "/App.js" && target !== "/index.js") result[target] = effective;
//       } else if (p !== "/App.js" && p !== "/index.js") {
//         result[p] = effective;
//       }
//     });
//     return result;
//   }, [files, unsaved]);

//   const sandpackOptions = React.useMemo(() => ({ externalResources: [], bundlerURL: undefined }), []);

//   // ── Handlers ──
//   const handleOpen = (p: string) => {
//     setActiveFile(p);
//     setOpenTabs((tabs) => tabs.includes(p) ? tabs : [...tabs, p]);
//     if (!files[p]) { const c = FILE_CONTENTS[p] ?? ""; if (c) setFile(p, c); }
//   };

//   const handleRename = (oldP: string, newP: string) => {
//     useProjectStore.getState().renameFile(oldP, newP);
//     if (activeFile === oldP) setActiveFile(newP);
//     setOpenTabs((tabs) => tabs.map((t) => t === oldP ? newP : t));
//   };

//   const handleDelete = (p: string) => {
//     useProjectStore.getState().deleteFile(p);
//     setOpenTabs((tabs) => tabs.filter((t) => t !== p));
//     if (activeFile === p) {
//       const remaining = openTabs.filter((t) => t !== p);
//       setActiveFile(remaining[0] ?? "");
//     }
//   };

//   const handleTabClose = (p: string) => {
//     if (unsaved?.[p]) commitUnsaved(p);
//     setOpenTabs((t) => t.filter((x) => x !== p));
//     if (activeFile === p) {
//       const next = openTabs.find((x) => x !== p);
//       setActiveFile(next ?? "");
//     }
//   };

//   return (
//     <SandpackProvider
//       template="react"
//       files={sandpackFiles}
//       theme="light"
//       options={sandpackOptions}
//     >
//       {/* Root shell — cream background fills everything */}
//       <main
//         style={{ height: "100vh", display: "flex", flexDirection: "column", background: BASE, color: TEXT, ...MONO }}
//       >
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }} ref={containerRef}>
//           <div style={{ height: "100%", display: "flex", minHeight: 0 }}>

//             {/* ── File explorer sidebar ── */}
//             <Toolbar
//               activeFile={activeFile}
//               onOpen={handleOpen}
//               onRename={handleRename}
//               onDelete={handleDelete}
//             />

//             {/* ── Main editor + preview column ── */}
//             <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

//               {/* Tab bar */}
//               <TabBar
//                 openTabs={openTabs}
//                 active={activeFile}
//                 unsaved={unsaved}
//                 showAIPanel={showAIPanel}
//                 onToggleAI={() => setShowAIPanel((v) => !v)}
//                 onResizePreview={handleProgrammaticResize}
//                 onSelect={(p) => setActiveFile(p)}
//                 onClose={handleTabClose}
//               />

//               {/* Resizable panels */}
//               <div style={{ flex: 1, minHeight: 0 }}>
//                 {initialized && (
//                   <ResizablePanelGroup direction="horizontal" className="h-full w-full">

//                     {/* AI panel — fixed width, not part of the resizable group */}
//                     {showAIPanel && (
//                       <AICodeGenerator onClose={() => setShowAIPanel(false)} />
//                     )}

//                     {/* Code editor panel */}
//                     <ResizablePanel defaultSize={0} minSize={0} maxSize={70}>
//                       <div style={{
//                         height: "100%",
//                         borderRight: `1px solid ${BORDER}`,
//                         background: BASE,
//                         overflow: "hidden",
//                       }}>
//                         <CodeEditor selectedPath={activeFile || undefined} />
//                       </div>
//                     </ResizablePanel>

//                     <ResizableHandle withHandle />

//                     {/* Live preview panel */}
//                     <ResizablePanel
//                       ref={previewPanelRef}
//                       minSize={isInitialLoad ? 0 : 30}
//                       maxSize={showAIPanel ? 0 : 100}
//                       defaultSize={100}
//                       onResize={(size) => { if (!isAnimating && !isInitialLoad) setCurrentSize(size); }}
//                     >
//                       <div style={{ height: "100%", position: "relative" }}>
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



"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import CodeEditor      from "@/components/CodeEditor";
import LivePreview     from "@/components/LivePreview";
import AICodeGenerator from "@/components/AICodeGenerator";
import Toolbar         from "@/components/Toolbar";
import { useProjectStore } from "@/hooks/useProjectStore";
import { X, Columns2, Maximize2, Smartphone, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG      = "#f5f5f3"
const SURFACE = "#ffffff"
const BORDER  = "#e3e3e0"
const BRHOVER = "#c8c8c4"
const TEXT    = "#1a1a1a"
const SUB     = "#6b6b6b"
const MUTED   = "#a8a8a4"
const SANS: React.CSSProperties = { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }
const MONO: React.CSSProperties = { fontFamily: "'Geist Mono', 'DM Mono', monospace" }

// ── Default files ─────────────────────────────────────────────────────────────
const FILE_CONTENTS: Record<string, string> = {
  "/App.js": `export default function App() {\n  return <h1>Hello Nebula 👋</h1>;\n}`,
  "/index.js": `import ReactDOM from "react-dom/client";\nimport App from "./App";\nconst root = ReactDOM.createRoot(document.getElementById("root"));\nroot.render(<App />);`,
  "/utils.js": `export function greet(name) {\n  return "Hello " + name;\n}`,
}

// ── Ext dot (tab bar) ─────────────────────────────────────────────────────────
function ExtDot({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  const colors: Record<string, string> = { js: "#92610a", jsx: "#92610a", ts: "#1d5fa6", tsx: "#1d5fa6", css: "#1a6b8a", scss: "#8a2060", html: "#8a3a10", json: "#6b6b10", md: MUTED }
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors[ext] ?? MUTED, flexShrink: 0, display: "inline-block" }} />
}

// ── Icon button ───────────────────────────────────────────────────────────────
function IconBtn({ children, title, onClick, active }: { children: React.ReactNode; title?: string; onClick?: () => void; active?: boolean }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width: 28, height: 28, borderRadius: 7, border: active ? `1px solid ${BRHOVER}` : "none", background: active ? BORDER : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: active ? TEXT : MUTED, cursor: "pointer", transition: "all 0.12s", flexShrink: 0 }}
      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BORDER; (e.currentTarget as HTMLElement).style.color = TEXT }}
      onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = active ? BORDER : "transparent"; (e.currentTarget as HTMLElement).style.color = active ? TEXT : MUTED }}
    >{children}</button>
  )
}
function Divider() { return <div style={{ width: 1, height: 16, background: BORDER, margin: "0 3px", flexShrink: 0 }} /> }

// ── Tab bar ───────────────────────────────────────────────────────────────────
interface TabBarProps {
  openTabs: string[]; active?: string
  onSelect: (p: string) => void; onClose: (p: string) => void
  unsaved?: Record<string, string> | null
  showAIPanel: boolean; onToggleAI: () => void
  onResizePreview: (size: number) => void
}

function TabBar({ openTabs, active, onSelect, onClose, unsaved, showAIPanel, onToggleAI, onResizePreview }: TabBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${BORDER}`, background: SURFACE, flexShrink: 0, height: 40 }}>
      {/* Tabs */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 6, gap: 1, overflowX: "auto", scrollbarWidth: "none", height: "100%" }}>
        {openTabs.length === 0 && <span style={{ fontSize: 11, color: MUTED, padding: "0 10px", ...MONO }}>No files open</span>}
        {openTabs.map((p) => {
          const name = p.split("/").pop() || p
          const isActive = active === p
          const isDirty  = !!unsaved?.[p]
          return (
            <div key={p} onClick={() => onSelect(p)}
              className="tab-item"
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: 6,
                padding: "0 10px", height: "100%", cursor: "pointer", flexShrink: 0, fontSize: 12,
                background: isActive ? BG : "transparent",
                color: isActive ? TEXT : SUB,
                borderRight: `1px solid ${BORDER}`,
                transition: "background 0.1s, color 0.1s",
                userSelect: "none", ...MONO,
              }}
              onMouseOver={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = BG }}
              onMouseOut={(e)  => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              <ExtDot name={name} />
              <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
              {isDirty && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#92610a", flexShrink: 0 }} />}
              {/* bottom active indicator */}
              {isActive && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: TEXT, borderRadius: "2px 2px 0 0" }} />}
              {openTabs.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); onClose(p) }}
                  className="tab-close"
                  style={{ width: 14, height: 14, borderRadius: 3, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, cursor: "pointer", padding: 0, flexShrink: 0, opacity: 0, transition: "opacity 0.1s" }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT; (e.currentTarget as HTMLElement).style.background = BORDER }}
                  onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.color = MUTED; (e.currentTarget as HTMLElement).style.background = "transparent" }}
                ><X size={10} /></button>
              )}
            </div>
          )
        })}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 10px", borderLeft: `1px solid ${BORDER}`, height: "100%", flexShrink: 0 }}>
        <IconBtn title="Full preview"   onClick={() => onResizePreview(100)}><Maximize2  size={12} /></IconBtn>
        <IconBtn title="Split view"     onClick={() => onResizePreview(60)} ><Columns2   size={12} /></IconBtn>
        <IconBtn title="Mobile preview" onClick={() => onResizePreview(30)} ><Smartphone size={12} /></IconBtn>
        <Divider />
        <IconBtn title="AI panel" onClick={onToggleAI} active={showAIPanel}><Sparkles size={12} /></IconBtn>
      </div>
    </div>
  )
}

// ── Studio ────────────────────────────────────────────────────────────────────
export default function StudioClient() {
  const containerRef      = useRef<HTMLDivElement | null>(null)
  const previewPanelRef   = useRef<any>(null)
  const editorPanelRef    = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)
  const sizeCycle         = [100, 60, 30]
  const cycleIndexRef     = useRef(0)

  const [activeFile,    setActiveFile]    = useState<string>("")
  const [openTabs,      setOpenTabs]      = useState<string[]>([])
  const [initialized,   setInitialized]   = useState(false)
  const [isAnimating,   setIsAnimating]   = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [currentSize,   setCurrentSize]   = useState(0)
  const [showAIPanel,   setShowAIPanel]   = useState(true)
  const [showEditor,    setShowEditor]    = useState(false) // hidden by default

  const files         = useProjectStore((s) => s.files)
  const setFile       = useProjectStore((s) => s.setFile)
  const unsaved       = useProjectStore((s) => s.unsaved)
  const commitUnsaved = useProjectStore((s) => s.commitUnsaved)
  const search        = useSearchParams()

  // Animated resize
  const handleProgrammaticResize = useCallback((targetSize: number) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    setIsAnimating(true)
    const startSize = currentSize, startTime = performance.now(), duration = 700
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased    = progress < 0.5 ? 8 * progress ** 4 : 1 - (-2 * progress + 2) ** 4 / 2
      previewPanelRef.current?.resize(startSize + (targetSize - startSize) * eased)
      if (progress < 1) { animationFrameRef.current = requestAnimationFrame(animate) }
      else { setIsAnimating(false); setCurrentSize(targetSize); animationFrameRef.current = null }
    }
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [currentSize])

  // Open first file
  useEffect(() => {
    if (activeFile) return
    const preferred = "/src/App.js"
    const first = files[preferred] ? preferred : Object.keys(files)[0]
    if (first) { setActiveFile(first); setOpenTabs([first]) }
  }, [files, activeFile])

  // Load from URL
  useEffect(() => {
    const pid = search.get("project")
    if (pid) {
      try { useProjectStore.getState().loadProject(pid); useProjectStore.getState().saveProject(pid) } catch {}
      setInitialized(true)
      setTimeout(() => { handleProgrammaticResize(60); setTimeout(() => setIsInitialLoad(false), 1100) }, 100)
    }
  }, [search])

  // Init defaults
  useEffect(() => {
    if (search.get("project")) return
    const current = useProjectStore.getState().files
    if (Object.keys(current).length === 0) Object.entries(FILE_CONTENTS).forEach(([p, c]) => useProjectStore.getState().setFile(p, c))
    setInitialized(true)
    setTimeout(() => { handleProgrammaticResize(60); setTimeout(() => setIsInitialLoad(false), 1100) }, 100)
  }, [search])

  // Auto-save
  useEffect(() => {
    const pid = useProjectStore.getState().currentProjectId
    if (!pid || !files || Object.keys(files).length === 0) return
    const t = setTimeout(() => { try { localStorage.setItem(`nebula:project:${pid}`, JSON.stringify({ files, unsaved: {}, savedAt: new Date().toISOString() })) } catch {} }, 2000)
    return () => clearTimeout(t)
  }, [files])

  // Resize cursor & tab hover
  useEffect(() => {
    const s = document.createElement("style")
    s.id = "__studio-styles__"
    s.textContent = `
      body.is-resizing iframe, body.is-resizing .cm-editor { pointer-events: none !important; }
      body.is-resizing * { pointer-events: none !important; }
      body.is-resizing { pointer-events: all !important; cursor: col-resize !important; user-select: none !important; }
      [data-resize-handle] { z-index: 50 !important; cursor: col-resize !important; touch-action: none; }
      .tab-item:hover .tab-close { opacity: 1 !important; }
    `
    document.head.appendChild(s)
    let dragging = false
    const down = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("[data-resize-handle]")) { dragging = true; document.body.classList.add("is-resizing") } }
    const move = (e: MouseEvent) => { if (dragging && e.buttons !== 1) { dragging = false; document.body.classList.remove("is-resizing") } }
    const up   = () => { if (dragging) { dragging = false; document.body.classList.remove("is-resizing") } }
    document.addEventListener("mousedown", down, true)
    document.addEventListener("mousemove", move, true)
    document.addEventListener("mouseup",   up,   true)
    return () => {
      s.remove()
      document.removeEventListener("mousedown", down, true)
      document.removeEventListener("mousemove", move, true)
      document.removeEventListener("mouseup",   up,   true)
      document.body.classList.remove("is-resizing")
    }
  }, [])

  useEffect(() => { const idx = sizeCycle.indexOf(currentSize); if (idx !== -1) cycleIndexRef.current = idx }, [currentSize])
  useEffect(() => () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current) }, [])

  // Sandpack files
  const sandpackFiles = React.useMemo(() => {
    const r: Record<string, string> = {}
    r["/App.js"]   = files["/App.js"] || files["/src/App.js"] || FILE_CONTENTS["/App.js"]
    r["/index.js"] = files["/index.js"] || FILE_CONTENTS["/index.js"]
    Object.entries(files).forEach(([p, c]) => {
      const eff = unsaved?.[p] ?? c
      if (p.startsWith("/src/")) { const t = `/${p.slice("/src/".length)}`; if (t !== "/App.js" && t !== "/index.js") r[t] = eff }
      else if (p !== "/App.js" && p !== "/index.js") r[p] = eff
    })
    return r
  }, [files, unsaved])
  const sandpackOptions = React.useMemo(() => ({ externalResources: [], bundlerURL: undefined }), [])

  // Handlers
  const handleOpen = (p: string) => {
    setActiveFile(p)
    setOpenTabs((t) => t.includes(p) ? t : [...t, p])
    if (!showEditor) {
      setShowEditor(true)
      // Give React a frame to update minSize/maxSize before expanding
      requestAnimationFrame(() => {
        editorPanelRef.current?.resize(40)
      })
    }
    if (!files[p]) { const c = FILE_CONTENTS[p] ?? ""; if (c) setFile(p, c) }
  }
  const handleRename = (o: string, n: string) => {
    useProjectStore.getState().renameFile(o, n)
    if (activeFile === o) setActiveFile(n)
    setOpenTabs((t) => t.map((x) => x === o ? n : x))
  }
  const handleDelete = (p: string) => {
    useProjectStore.getState().deleteFile(p)
    const remaining = openTabs.filter((x) => x !== p)
    setOpenTabs(remaining)
    if (remaining.length === 0) setShowEditor(false)
    if (activeFile === p) setActiveFile(remaining[0] ?? "")
  }
  const handleTabClose = (p: string) => {
    if (unsaved?.[p]) commitUnsaved(p)
    const remaining = openTabs.filter((x) => x !== p)
    setOpenTabs(remaining)
    if (remaining.length === 0) setShowEditor(false)
    if (activeFile === p) setActiveFile(remaining.find((x) => x !== p) ?? "")
  }

  return (
    <SandpackProvider template="react" files={sandpackFiles} theme="light" options={sandpackOptions}>
      <main style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, color: TEXT, ...MONO }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }} ref={containerRef}>
          <div style={{ height: "100%", display: "flex", minHeight: 0 }}>

            {/* Sidebar */}
            <Toolbar activeFile={activeFile} onOpen={handleOpen} onRename={handleRename} onDelete={handleDelete} />

            {/* Main column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <TabBar
                openTabs={openTabs} active={activeFile} unsaved={unsaved}
                showAIPanel={showAIPanel} onToggleAI={() => setShowAIPanel((v) => !v)}
                onResizePreview={handleProgrammaticResize}
                onSelect={(p) => setActiveFile(p)}
                onClose={handleTabClose}
              />

              <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                {/* AI panel — fixed 360px, no resize handle */}
                {showAIPanel && (
                  <div style={{ width: 360, flexShrink: 0, overflow: "hidden", borderRight: `1px solid ${BORDER}` }}>
                    <AICodeGenerator onClose={() => setShowAIPanel(false)} />
                  </div>
                )}

                {initialized && (
                  <ResizablePanelGroup direction="horizontal" className="h-full w-full">

                    {/* Code editor — always mounted, hidden via width when not shown */}
                    <ResizablePanel
                      ref={editorPanelRef}
                      defaultSize={0}
                      minSize={showEditor ? 10 : 0}
                      maxSize={showEditor ? 70 : 0}
                      collapsible
                      collapsedSize={0}
                      style={{ display: showEditor ? undefined : "none" }}
                    >
                      <div style={{ height: "100%", borderRight: `1px solid ${BORDER}`, background: SURFACE, overflow: "hidden" }}>
                        <CodeEditor selectedPath={activeFile || undefined} />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle style={{ display: showEditor ? undefined : "none" }} />

                    {/* Live preview — always visible */}
                    <ResizablePanel
                      ref={previewPanelRef}
                      minSize={isInitialLoad ? 0 : 20}
                      maxSize={100}
                      defaultSize={100}
                      onResize={(size) => { if (!isAnimating && !isInitialLoad) setCurrentSize(size) }}
                    >
                      <div style={{ height: "100%", position: "relative" }}>
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
  )
}