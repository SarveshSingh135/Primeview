import Link from "next/link"

// 🔍 OMDB search function
async function searchOMDB(query: string) {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${query}`,
      { cache: "no-store" }
    )

    const data = await res.json()

    return data.Search || []
  } catch (error) {
    console.error("OMDB Error:", error)
    return []
  }
}

export default async function Page({ params }: any) {

  // ✅ Next.js 16 fix (VERY IMPORTANT)
  const resolvedParams = await params
  const id = resolvedParams?.id

  // ❌ safety check
  if (!id || typeof id !== "string") {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-2xl">Invalid URL ❌</p>
      </div>
    )
  }

  // ✅ URL → readable text
  const query = id.replace(/-/g, " ")

  // 🔍 fetch movies
  const movies = await searchOMDB(query)

  // ❌ no results
  if (!movies.length) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-2xl">No results found 😔</p>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen p-6">

      {/* 🔥 Heading */}
      <h1 className="text-3xl font-bold mb-6 capitalize">
        🔍 Results for "{query}"
      </h1>

      {/* 🎬 Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {movies.map((movie: any) => (
          <Link key={movie.imdbID} href={`/movie/${movie.imdbID}`}>
            
            <div className="hover:scale-105 transition cursor-pointer">

              <img
                src={
                  movie.Poster !== "N/A"
                    ? movie.Poster
                    : "https://via.placeholder.com/300x450"
                }
                alt={movie.Title}
                className="rounded-lg w-full"
              />

              <h2 className="mt-2 text-sm font-semibold">
                {movie.Title}
              </h2>

              <p className="text-gray-400 text-sm">
                {movie.Year}
              </p>

            </div>

          </Link>
        ))}
      </div>

    </div>
  )
}