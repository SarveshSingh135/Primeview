"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function MovieDetail() {
  const params = useParams()
  const id = params.id as string

  const [isSaved, setIsSaved] = useState(false)

  // 🎬 Fetch movie details
  const fetchMovie = async () => {
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${id}`
    )

    const data = await res.json()

    if (data.Response === "False") {
      throw new Error("Movie not found ❌")
    }

    return data
  }

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ["movie", id],
    queryFn: fetchMovie,
  })

  // ⭐ Check if already in watchlist
  useEffect(() => {
    if (!movie) return

    const existing = JSON.parse(localStorage.getItem("watchlist") || "[]")
    const found = existing.find((m: any) => m.imdbID === movie.imdbID)
    setIsSaved(!!found)
  }, [movie])

  // 🔁 Toggle watchlist
  const toggleWatchlist = () => {
    const existing = JSON.parse(localStorage.getItem("watchlist") || "[]")

    let updated

    if (isSaved) {
      updated = existing.filter((m: any) => m.imdbID !== movie.imdbID)
    } else {
      updated = [...existing, movie]
    }

    localStorage.setItem("watchlist", JSON.stringify(updated))
    setIsSaved(!isSaved)
  }

  // ⏳ Loading
  if (isLoading) {
    return <p className="p-6 text-white">Loading...</p>
  }

  // ❌ Error
  if (error) {
    return (
      <p className="p-6 text-red-500">
        {(error as Error).message}
      </p>
    )
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white">

      <div className="flex flex-col md:flex-row gap-6">

        {/* 🎬 Poster */}
        <img
          src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
          className="w-[300px] rounded-xl"
        />

        {/* 📄 Details */}
        <div>

          <h1 className="text-3xl font-bold mb-2">
            {movie.Title}
          </h1>

          <p className="text-gray-400 mb-2">
            {movie.Year} • {movie.Genre}
          </p>

          <p className="mb-2">
            ⭐ IMDB: {movie.imdbRating}
          </p>

          <p className="mb-2">
            🎭 Actors: {movie.Actors}
          </p>

          <p className="mb-2">
            🎬 Director: {movie.Director}
          </p>

          <p className="text-gray-300 mt-4 max-w-xl">
            {movie.Plot}
          </p>

          {/* ⭐ Watchlist Button */}
          <button
            onClick={toggleWatchlist}
            className={`mt-6 px-4 py-2 rounded font-bold ${
              isSaved
                ? "bg-red-500"
                : "bg-yellow-500 text-black"
            }`}
          >
            {isSaved
              ? "❌ Remove from Watchlist"
              : "⭐ Add to Watchlist"}
          </button>

        </div>

      </div>

    </div>
  )
}