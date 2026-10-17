"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function ActorHero({
  id,
  movies = [],
}: {
  id: string
  movies: any[]
}) {

  const [bgIndex, setBgIndex] = useState(0)

  // Background slider
  useEffect(() => {
    if (movies.length === 0) return

    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % movies.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [movies.length])

  // Poster handling
  const bgPoster =
    movies?.[bgIndex]?.Poster &&
    movies?.[bgIndex]?.Poster !== "N/A"
      ? movies[bgIndex].Poster
      : "/no-image.png"

  const mainPoster =
    movies?.[0]?.Poster &&
    movies?.[0]?.Poster !== "N/A"
      ? movies[0].Poster
      : "/no-image.png"

  // ✅ HYDRATION SAFE VALUES
  const credits = movies.length
  const awards = Math.floor(movies.length / 2)
  const rating = 8.5

  return (
    <section className="relative min-h-[90vh] flex items-center px-12 overflow-hidden bg-black">

      {/* BACKGROUND */}
      {movies.length > 0 && (
        <motion.div
          key={bgIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 -z-20"
        >
          <img
            src={bgPoster}
            className="w-full h-full object-cover blur-3xl brightness-40 scale-110"
            alt="background poster"
          />
        </motion.div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 -z-10" />

      <div className="grid md:grid-cols-2 gap-16 items-center w-full">

        {/* LEFT */}
        <div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="
              text-7xl font-extrabold capitalize
              bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500
              bg-clip-text text-transparent
            "
          >
            {id || "Unknown Actor"}
          </motion.h1>

          <p className="text-zinc-300 mt-6 text-lg max-w-md">
            Explore the cinematic journey of{" "}
            <span className="text-white font-semibold">
              {id || "this actor"}
            </span>.
          </p>

          {/* STATS */}
          <div className="flex gap-6 mt-8">
            <Stat label="Credits" value={credits} />
            <Stat label="Awards" value={awards} />
          </div>

        </div>

        {/* RIGHT */}
        <motion.div
          whileHover={{
            rotateY: 10,
            rotateX: -5,
            scale: 1.05,
          }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="relative w-80 h-125">

            <Image
              src={mainPoster}
              alt={`${id || "Actor"} official poster`}
              fill
              className="rounded-3xl object-cover shadow-2xl"
            />

            {/* ⭐ Rating */}
            <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              ⭐ {rating}
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl">
      <p className="text-xl font-bold text-yellow-400">{value}+</p>
      <p className="text-xs text-zinc-400">{label}</p>
    </div>
  )
}