"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

type ModernDrawerProps = {
  children: React.ReactNode;
};

export default function ModernDrawer({ children }: ModernDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      setWidth(contentRef.current.scrollWidth);
    }
  }, [children]);

  return (
    <div className="relative">
      <div className="absolute top-140 right-0 h-8 flex items-center z-10">
        {/* Drawer */}
        <div
          className="
            h-12 overflow-hidden rounded-l-lg
            bg-card
            transition-[max-width,opacity] duration-500 ease-out
          "
          style={{
            maxWidth: isOpen ? width : 0,
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div
            ref={contentRef}
            className="h-14 px-6 flex items-center gap-4 whitespace-nowrap"
          >
            {children}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className={`w-8 h-12 flex items-center justify-center bg-card/25 transition-all duration-500
            ${isOpen ? "rounded-bl-none border-l bg-card/100" : "rounded-l-lg hover:bg-card/80"}
          `}
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform duration-500 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
