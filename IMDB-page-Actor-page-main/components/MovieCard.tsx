"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToWatchlist, isInWatchlist } from "@/lib/watchlist";

export default function MovieCard({ movie }: any) {
  const [mounted, setMounted] = useState(false);
  const [added, setAdded] = useState(false);

  // ✅ run only on client
  useEffect(() => {
    setMounted(true);
    setAdded(isInWatchlist(movie?.imdbID));
  }, [movie?.imdbID]);

  const handleAdd = () => {
    addToWatchlist({
      imdbID: movie.imdbID,
      Title: movie.Title,
      Poster: movie.Poster,
      Year: movie.Year,
    });

    setAdded(true);
    alert("Added to Watchlist ✅");
  };

  // ❗ SSR safe
  if (!mounted) return null;

  return (
    <div className="bg-gray-800 p-3 rounded shadow">

      <Link href={`/movie/${movie.imdbID}`}>
        <img
          src={movie.Poster}
          alt={movie.Title}
          className="w-full h-60 object-cover rounded mb-2 cursor-pointer"
        />
      </Link>

      <h2 className="text-sm font-bold">{movie.Title}</h2>
      <p className="text-gray-400 text-xs">{movie.Year}</p>

      <button
        onClick={handleAdd}
        disabled={added}
        className={`mt-2 w-full py-1 rounded text-sm font-bold ${
          added
            ? "bg-green-500 text-black"
            : "bg-yellow-500 text-black"
        }`}
      >
        {added ? "✅ Added" : "➕ Add to Watchlist"}
      </button>

    </div>
  );
}