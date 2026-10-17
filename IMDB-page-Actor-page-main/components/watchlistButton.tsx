"use client"

import { useEffect, useState } from "react"
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/lib/watchlist"

export default function WatchlistButton({ movie }: any) {
  const [added, setAdded] = useState(false)

  // 🔥 YE YAHAN LIKHNA HAI
  useEffect(() => {
    setAdded(isInWatchlist(movie.imdbID))

    const handler = () => {
      setAdded(isInWatchlist(movie.imdbID))
    }

    window.addEventListener("watchlistUpdated", handler)

    return () => {
      window.removeEventListener("watchlistUpdated", handler)
    }
  }, [movie.imdbID])

  const toggle = () => {
    if (added) {
      removeFromWatchlist(movie.imdbID)
    } else {
      addToWatchlist(movie)
    }

    // 🔥 EVENT FIRE KARNA NA BHULNA
    window.dispatchEvent(new Event("watchlistUpdated"))
  }

  return (
    <button
      onClick={toggle}
      className="mt-4 px-4 py-2 rounded bg-yellow-400 text-black"
    >
      {added ? "Remove ❌" : "Add to Watchlist ⭐"}
    </button>
  )
}