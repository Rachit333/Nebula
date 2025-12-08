"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "group relative flex w-px select-none touch-none items-center justify-center bg-border/0 transition-colors duration-200 hover:bg-primary/10 active:bg-primary/20 focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center">
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 transition-opacity duration-200 group-hover:opacity-100 opacity-0 data-[panel-group-direction=vertical]:inset-x-0 data-[panel-group-direction=vertical]:top-1/2 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:-translate-y-1/2 data-[panel-group-direction=vertical]:translate-x-0" />
      </div>
      {withHandle && (
        <div className="z-10 flex h-8 w-8 items-center justify-center rounded-md bg-muted transition-all duration-200 group-hover:bg-accent group-active:scale-95 border border-border/50 group-hover:border-accent/50">
          <GripVerticalIcon className="size-4 text-muted-foreground group-hover:text-accent-foreground transition-colors duration-200" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
