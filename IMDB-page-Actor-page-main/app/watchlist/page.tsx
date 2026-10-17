"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  getWatchlist,
  removeFromWatchlist,
} from "@/lib/watchlist"

export default function WatchlistPage() {
  const [movies, setMovies] = useState<any[]>([])

  // ✅ Load watchlist from localStorage
  useEffect(() => {
    const data: any[] = getWatchlist()
    console.log("WATCHLIST DATA:", data) // debug
    setMovies(data)
  }, [])

  // ✅ Remove movie
  const handleRemove = (id: string) => {
    removeFromWatchlist(id)
    setMovies(getWatchlist() as any[]) // refresh UI
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white">

      {/* 🔝 Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">⭐ My Watchlist</h1>

        <Link href="/">
          <button className="bg-yellow-500 px-4 py-2 rounded text-black font-bold">
            ⬅ Back
          </button>
        </Link>
      </div>

      {/* 😢 Empty */}
      {movies.length === 0 && (
        <p className="text-gray-400">
          No movies in watchlist 😢
        </p>
      )}

      {/* 🎬 Movies Grid */}
      {movies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          {movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-gray-800 p-3 rounded shadow"
            >
              {/* Poster */}
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="w-full h-60 object-cover rounded mb-2"
              />

              {/* Title */}
              <h2 className="text-sm font-bold">
                {movie.Title}
              </h2>

              {/* Year */}
              <p className="text-gray-400 text-xs">
                {movie.Year}
              </p>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(movie.imdbID)}
                className="mt-2 w-full bg-red-500 py-1 rounded text-sm"
              >
                ❌ Remove
              </button>
            </div>
          ))}

        </div>
      )}
    </div>
  )
}