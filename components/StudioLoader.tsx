"use client"
import dynamic from "next/dynamic"
import React from "react"

const StudioClient = dynamic(() => import("@/components/StudioClient"), { ssr: false })

export default function StudioLoader() {
  return <StudioClient />
}
