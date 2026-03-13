// "use client"

// import { useState } from "react"
// import { useProjectsStore } from "@/hooks/useProjectsStore"
// import { ProjectCard } from "@/components/project-card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Plus, Upload } from "lucide-react"

// export default function HomePage() {
//   const { projects, addProject, deleteProject, refresh } = useProjectsStore()
//   const [isOpen, setIsOpen] = useState(false)
//   const [formData, setFormData] = useState({ name: "", description: "" })

//   function handleCreateProject() {
//     if (formData.name.trim()) {
//       const meta = addProject({ name: formData.name, description: formData.description, status: "active" })
//       setFormData({ name: "", description: "" })
//       setIsOpen(false)
//       refresh()
//       // TODO: Re-enable Upstash Redis sync when ready
//       // try {
//       //   import("@/lib/firebaseClient").then(async (m) => {
//       //     const getIdToken = m.getIdToken as () => Promise<string | null>;
//       //     const token = await getIdToken();
//       //     if (!token) return;
//       //     const projectKey = `nebula:project:${meta.id}`;
//       //     const raw = localStorage.getItem(projectKey);
//       //     if (!raw) return;
//       //     const payload = JSON.parse(raw);
//       //     fetch("/api/upstash/push", {
//       //       method: "POST",
//       //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       //       body: JSON.stringify({ files: payload.files, projectId: meta.id }),
//       //     }).catch(() => {});
//       //   });
//       // } catch (e) {}
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="border-b border-border bg-card">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <div className="flex items-center justify-between mb-2">
//             <h1 className="text-3xl font-bold text-foreground">Projects</h1>
//             <div className="flex gap-3">
//               <Button variant="outline" size="sm" onClick={() => refresh()}>
//                 <Upload className="w-4 h-4 mr-2" />
//                 Load
//               </Button>
//               <div>
//                 <Button size="sm" onClick={() => setIsOpen(true)}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create New
//                 </Button>
//                 {isOpen && (
//                   <div className="fixed inset-0 z-50 flex items-center justify-center">
//                     <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
//                     <div className="relative bg-card rounded-lg p-6 w-full max-w-lg">
//                       <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
//                       <p className="text-sm text-muted-foreground mb-4">Start a new project by entering a name and description.</p>
//                       <div className="space-y-4">
//                         <div>
//                           <label className="text-sm font-medium text-foreground mb-2 block">Project Name</label>
//                           <Input
//                             placeholder="My Awesome Project"
//                             value={formData.name}
//                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                           />
//                         </div>
//                         <div>
//                           <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
//                           <Input
//                             placeholder="What is this project about?"
//                             value={formData.description}
//                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                           />
//                         </div>
//                         <div className="flex gap-3 justify-end pt-4">
//                           <Button variant="outline" onClick={() => setIsOpen(false)}>
//                             Cancel
//                           </Button>
//                           <Button onClick={handleCreateProject}>Create Project</Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//           <p className="text-muted-foreground">
//             {projects.length} project{projects.length !== 1 ? "s" : ""}
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-12">
//         {projects.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground mb-4">No projects yet</p>
//             <div>
//               <Button onClick={() => setIsOpen(true)}>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Create Your First Project
//               </Button>
//               {isOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center">
//                   <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
//                   <div className="relative bg-card rounded-lg p-6 w-full max-w-lg">
//                     <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
//                     <p className="text-sm text-muted-foreground mb-4">Start a new project by entering a name and description.</p>
//                     <div className="space-y-4">
//                       <div>
//                         <label className="text-sm font-medium text-foreground mb-2 block">Project Name</label>
//                         <Input
//                           placeholder="My Awesome Project"
//                           value={formData.name}
//                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         />
//                       </div>
//                       <div>
//                         <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
//                         <Input
//                           placeholder="What is this project about?"
//                           value={formData.description}
//                           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                         />
//                       </div>
//                       <div className="flex gap-3 justify-end pt-4">
//                         <Button variant="outline" onClick={() => setIsOpen(false)}>
//                           Cancel
//                         </Button>
//                         <Button onClick={handleCreateProject}>Create Project</Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {projects.map((project) => (
//               <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


"use client"

import { useState, useEffect, useRef } from "react"
import { useProjectsStore } from "@/hooks/useProjectsStore"
import { ProjectCard } from "@/components/project-card"
import { Plus, RefreshCw, X, ArrowRight, Layers } from "lucide-react"

/* ─── Modal component ─── */
function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: { name: string; description: string }) => void
}) {
  const [formData, setFormData] = useState({ name: "", description: "" })

  function handleSubmit() {
    if (formData.name.trim()) onCreate(formData)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 animate-[overlayIn_0.2s_ease_both]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-[#080a0e]/85 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative bg-[#0f1117] border border-white/15 rounded-2xl w-full max-w-[480px] overflow-hidden animate-[modalIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        {/* top accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-[#c8f04b] to-[#c8f04b]/30" />

        <div className="p-8">
          {/* header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <div className="font-[Syne] font-extrabold text-xl tracking-tight text-[#f0f2f5]">
                New Project
              </div>
              <div className="text-[11px] text-white/40 mt-1 leading-relaxed font-[DM_Mono]">
                Give your project a name and description.
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-[30px] h-[30px] rounded-md border border-white/7 bg-transparent text-white/40 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-150 hover:text-[#f0f2f5] hover:border-white/15 hover:bg-white/5"
            >
              <X size={14} />
            </button>
          </div>

          {/* fields */}
          <div className="mb-[18px]">
            <label className="block text-[10px] tracking-[0.12em] uppercase text-white/22 mb-2 font-[DM_Mono]">
              Project Name
            </label>
            <input
              className="w-full font-[DM_Mono] text-[13px] text-[#f0f2f5] bg-[#080a0e] border border-white/7 rounded-lg px-[14px] py-[11px] outline-none transition-all duration-200 placeholder:text-white/22 focus:border-[#c8f04b]/40 focus:shadow-[0_0_0_3px_rgba(200,240,75,0.08)]"
              placeholder="my-awesome-project"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[10px] tracking-[0.12em] uppercase text-white/22 mb-2 font-[DM_Mono]">
              Description
            </label>
            <input
              className="w-full font-[DM_Mono] text-[13px] text-[#f0f2f5] bg-[#080a0e] border border-white/7 rounded-lg px-[14px] py-[11px] outline-none transition-all duration-200 placeholder:text-white/22 focus:border-[#c8f04b]/40 focus:shadow-[0_0_0_3px_rgba(200,240,75,0.08)]"
              placeholder="What does this project do?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* footer */}
          <div className="flex gap-[10px] justify-end mt-7 pt-5 border-t border-white/7">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 font-[DM_Mono] text-[12px] font-normal tracking-[0.04em] text-white/40 bg-transparent border border-white/15 px-[18px] py-[11px] rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap hover:text-[#f0f2f5] hover:border-white/28 hover:bg-white/4"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 font-[DM_Mono] text-[12px] font-medium tracking-[0.04em] text-[#080a0e] bg-[#c8f04b] border-none px-5 py-[11px] rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#d9ff5c] hover:shadow-[0_0_20px_rgba(200,240,75,0.25),0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-px active:translate-y-0"
            >
              Create Project <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function HomePage() {
  const { projects, addProject, deleteProject, refresh } = useProjectsStore()
  const [isOpen, setIsOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)

  function handleRefresh() {
    setSpinning(true)
    refresh()
    setTimeout(() => setSpinning(false), 700)
  }

  function handleCreate(data: { name: string; description: string }) {
    addProject({ name: data.name, description: data.description, status: "active" })
    setIsOpen(false)
    refresh()
  }

  return (
    <div className="font-[DM_Mono] bg-[#080a0e] min-h-screen text-[#f0f2f5] overflow-x-hidden relative before:content-[''] before:fixed before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.04%22%2F%3E%3C%2Fsvg%3E')] before:opacity-35 before:pointer-events-none before:z-0">

      {/* ── Ambient blobs ── */}
      <div className="fixed w-[700px] h-[700px] -top-[200px] -right-[200px] bg-[radial-gradient(circle,rgba(200,240,75,0.06)_0%,transparent_70%)] pointer-events-none z-0 animate-[blobDrift_12s_ease-in-out_infinite_alternate]" />
      <div className="fixed w-[500px] h-[500px] -bottom-[100px] -left-[100px] bg-[radial-gradient(circle,rgba(100,160,255,0.05)_0%,transparent_70%)] pointer-events-none z-0 animate-[blobDrift_16s_ease-in-out_infinite_alternate-reverse]" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/7 bg-gradient-to-b from-[#0f1117]/98 to-[#080a0e]/95 backdrop-blur-[20px]">
        <div className="max-w-[1280px] mx-auto px-10 h-16 flex items-center justify-between">
          {/* wordmark */}
          <div className="flex items-center gap-[10px]">
            <div className="w-[30px] h-[30px] bg-[#c8f04b] rounded-md flex items-center justify-center">
              <Layers size={16} className="text-[#080a0e]" />
            </div>
            <span className="font-[Syne] font-extrabold text-base tracking-[-0.02em] text-[#f0f2f5]">
              Nebula
            </span>
          </div>

          {/* actions */}
          <div className="flex items-center gap-[10px]">
            <button
              onClick={handleRefresh}
              title="Sync projects"
              className="w-9 h-9 flex items-center justify-center bg-transparent border border-white/15 rounded-lg cursor-pointer text-white/40 transition-all duration-200 hover:text-[#f0f2f5] hover:border-white/28 hover:bg-white/4"
            >
              <RefreshCw size={14} className={spinning ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 font-[DM_Mono] text-[12px] font-medium tracking-[0.04em] text-[#080a0e] bg-[#c8f04b] border-none px-5 py-[11px] rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#d9ff5c] hover:shadow-[0_0_20px_rgba(200,240,75,0.25),0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-px active:translate-y-0"
            >
              <Plus size={13} /> New Project
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-10 pt-20 pb-16">
        {/* eyebrow */}
        <div className="inline-flex items-center gap-2 font-[DM_Mono] text-[11px] font-medium tracking-[0.12em] uppercase text-[#c8f04b] bg-[rgba(200,240,75,0.12)] border border-[rgba(200,240,75,0.2)] px-3 py-[5px] rounded-full mb-7 animate-[fadeUp_0.6s_ease_both]">
          <span className="w-[5px] h-[5px] rounded-full bg-[#c8f04b] animate-[pulse_2s_ease-in-out_infinite]" />
          Workspace
        </div>

        <h1 className="font-[Syne] font-extrabold text-[clamp(48px,6vw,80px)] leading-none tracking-[-0.04em] text-[#f0f2f5] mb-5 animate-[fadeUp_0.6s_0.1s_ease_both]">
          Your
          <br />
          <em className="not-italic text-transparent [-webkit-text-stroke:1.5px_#c8f04b]">
            Projects
          </em>
        </h1>

        <p className="font-[DM_Mono] text-[13px] text-white/40 mb-12 leading-[1.7] max-w-[440px] animate-[fadeUp_0.6s_0.2s_ease_both]">
          Manage, build, and ship. Everything you're working on, in one place.
        </p>

        {projects.length > 0 && (
          <div className="flex items-center gap-[14px] animate-[fadeUp_0.6s_0.3s_ease_both]">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 font-[DM_Mono] text-[12px] font-medium tracking-[0.04em] text-[#080a0e] bg-[#c8f04b] border-none px-5 py-[11px] rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#d9ff5c] hover:shadow-[0_0_20px_rgba(200,240,75,0.25),0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-px active:translate-y-0"
            >
              <Plus size={13} /> New Project
            </button>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 font-[DM_Mono] text-[12px] font-normal tracking-[0.04em] text-white/40 bg-transparent border border-white/15 px-[18px] py-[11px] rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap hover:text-[#f0f2f5] hover:border-white/28 hover:bg-white/4"
            >
              <RefreshCw size={12} /> Sync
            </button>
          </div>
        )}
      </section>

      {/* ── Stats bar ── */}
      {projects.length > 0 && (
        <div className="relative z-10 max-w-[1280px] mx-auto px-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="flex items-baseline gap-8 py-5">
            <div className="flex items-baseline gap-2">
              <span className="font-[Syne] text-[22px] font-bold text-[#f0f2f5]">
                {projects.length}
              </span>
              <span className="text-[11px] text-white/22 tracking-[0.08em] uppercase font-[DM_Mono]">
                Projects
              </span>
            </div>
            <div className="w-px h-5 bg-white/7" />
            <div className="flex items-baseline gap-2">
              <span className="font-[Syne] text-[22px] font-bold text-[#f0f2f5]">
                {projects.filter((p: any) => p.status === "active").length}
              </span>
              <span className="text-[11px] text-white/22 tracking-[0.08em] uppercase font-[DM_Mono]">
                Active
              </span>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>
      )}

      {/* ── Content ── */}
      {projects.length === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center px-10 py-[100px] text-center">
          <div className="relative w-[100px] h-[100px] border border-white/15 rounded-[20px] flex items-center justify-center mb-7 bg-[#0f1117] before:content-[''] before:absolute before:inset-[-1px] before:rounded-[20px] before:bg-gradient-to-br before:from-[rgba(200,240,75,0.15)] before:to-transparent before:pointer-events-none">
            <Layers size={36} className="text-[#c8f04b] opacity-70" />
          </div>
          <div className="font-[Syne] text-[22px] font-bold text-[#f0f2f5] mb-[10px] tracking-[-0.02em]">
            No projects yet
          </div>
          <div className="text-[12px] text-white/40 mb-8 leading-[1.7] max-w-[300px] font-[DM_Mono]">
            Create your first project to get started. Everything you build lives here.
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 font-[DM_Mono] text-[12px] font-medium tracking-[0.04em] text-[#080a0e] bg-[#c8f04b] border-none px-5 py-[11px] rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#d9ff5c] hover:shadow-[0_0_20px_rgba(200,240,75,0.25),0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-px active:translate-y-0"
          >
            <Plus size={13} /> Create First Project
          </button>
        </div>
      ) : (
        <div className="relative z-10 max-w-[1280px] mx-auto px-10 pt-10 pb-20">
          <div className="text-[10px] tracking-[0.15em] uppercase text-white/22 mb-6 flex items-center gap-[10px] font-[DM_Mono] after:content-[''] after:flex-1 after:h-px after:bg-white/7">
            All Projects
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-px bg-white/7 border border-white/7 rounded-[14px] overflow-hidden">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="bg-[#0f1117] transition-colors duration-200 hover:bg-[#151820]"
              >
                <ProjectCard project={project} onDelete={deleteProject} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {isOpen && (
        <CreateModal onClose={() => setIsOpen(false)} onCreate={handleCreate} />
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes blobDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-60px, 80px) scale(1.08); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}