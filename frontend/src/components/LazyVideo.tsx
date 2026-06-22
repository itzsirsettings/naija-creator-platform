"use client"

import { useEffect, useRef } from "react"

interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
}

export default function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        if (el.src) return
        el.src = src
        el.load()
        el.play().catch(() => {})
        observer.disconnect()
      },
      { rootMargin: "300px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={videoRef}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  )
}
