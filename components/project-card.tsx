"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Trash2 } from "lucide-react";

export function ProjectCard({ project, onDelete }: any) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const initials =
    (project.name
      .split(/[\s\-_]/)
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? "")
      .join("")) || (project.name[0]?.toUpperCase() ?? "?");

  const hue = [...(project.name as string)].reduce(
    (acc, c) => acc + c.charCodeAt(0),
    0
  ) % 360;
  const accentColor = `hsl(${hue}, 70%, 63%)`;
  const accentDim = `hsla(${hue}, 70%, 63%, 0.12)`;
  const accentBorder = `hsla(${hue}, 70%, 63%, 0.25)`;

  return (
    <div
      className="group relative flex flex-col gap-4 p-5 cursor-default"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* top accent line on hover */}
      <div
        className="absolute top-0 left-5 right-5 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      {/* avatar + name */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-bold transition-transform duration-200 group-hover:scale-105"
          style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            color: accentColor,
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0 pt-[2px]">
          <div
            className="font-bold text-[14px] tracking-[-0.02em] text-[#f0f2f5] truncate leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {project.name}
          </div>

          {/* status dot */}
          <div className="flex items-center gap-[5px] mt-1">
            <span
              className="w-[5px] h-[5px] rounded-full flex-shrink-0"
              style={{
                background: project.status === "active" ? "#c8f04b" : "rgba(240,242,245,0.22)",
                boxShadow: project.status === "active" ? "0 0 6px rgba(200,240,75,0.55)" : "none",
              }}
            />
            <span className="text-[9px] tracking-[0.1em] uppercase text-[rgba(240,242,245,0.32)]">
              {project.status ?? "active"}
            </span>
          </div>
        </div>
      </div>

      {/* description */}
      {project.description && (
        <p className="text-[11px] leading-[1.65] text-[rgba(240,242,245,0.36)] line-clamp-2 -mt-1">
          {project.description}
        </p>
      )}

      {/* actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        {/* Open */}
        <button
          onClick={() => router.push(`/studio?project=${encodeURIComponent(project.id)}`)}
          className="flex-1 inline-flex items-center justify-center gap-[5px] text-[11px] font-medium tracking-[0.04em] rounded-md px-3 py-[7px] border transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            fontFamily: "'DM Mono', monospace",
            color: accentColor,
            background: accentDim,
            borderColor: accentBorder,
          }}
        >
          Open <ArrowUpRight size={11} />
        </button>

        {/* Delete — two-step confirm */}
        {confirming ? (
          <div className="flex items-center gap-[5px]">
            <button
              onClick={() => onDelete(project.id)}
              className="text-[10px] tracking-[0.06em] font-medium text-red-400 bg-red-500/10 border border-red-500/25 rounded-md px-3 py-[7px] hover:bg-red-500/20 transition-colors duration-150 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-[rgba(240,242,245,0.3)] hover:text-[#f0f2f5] hover:border-white/20 transition-colors duration-150"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-white/7 text-[rgba(240,242,245,0.25)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.08] transition-all duration-200"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </div>
  );
}

export default ProjectCard;