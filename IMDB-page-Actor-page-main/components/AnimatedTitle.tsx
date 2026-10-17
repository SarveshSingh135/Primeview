"use client"

import { motion } from "framer-motion"

export default function AnimatedTitle({ name }: { name: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-7xl font-extrabold capitalize bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
    >
      {name}
    </motion.h1>
  )
}
