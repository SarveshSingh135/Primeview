"use client"

import { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

export default function VirtualFilmography({ movies }: any) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
  })

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border border-zinc-700 rounded"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const movie = movies[virtualRow.index]

          return (
            <div
              key={`${movie.imdbID}-${virtualRow.index}`}
              className="absolute left-0 w-full p-4 border-b border-zinc-800"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="flex gap-4 items-center">
                <img
                  src={
                    movie.Poster !== "N/A"
                      ? movie.Poster
                      : "/no-image.png"
                  }
                  alt={movie.Title}
                  className="w-20 h-28 object-contain bg-black rounded"
                />
                <div>
                  <h2 className="font-semibold text-lg">
                    {movie.Title}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {movie.Year} • {movie.Type}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}