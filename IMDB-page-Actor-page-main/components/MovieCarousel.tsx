"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export default function MovieCarousel({ images }: any) {
  const [index, setIndex] = useState(0)

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length)
  }

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative w-[300px] h-[450px]">

      <motion.img
        key={index}
        src={images[index]}
        className="w-full h-full object-cover rounded-xl"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Buttons */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 bg-black/60 px-2 py-1"
      >
        ◀
      </button>

      <button
        onClick={next}
        className="absolute right-2 top-1/2 bg-black/60 px-2 py-1"
      >
        ▶
      </button>

    </div>
  )
}