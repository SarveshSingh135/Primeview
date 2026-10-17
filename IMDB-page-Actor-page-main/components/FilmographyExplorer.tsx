import Link from "next/link"
import Image from "next/image"

export default function FilmographyExplorer({ movies }: any) {

  const uniqueMovies = Array.from(
    new Map(movies.map((m: any) => [m.imdbID, m])).values()
  )

  return (
    <div className="p-12 bg-black text-white">
      <h2 className="text-3xl font-bold mb-8">Filmography</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {uniqueMovies.map((movie: any) => (

          // ✅ IMPORTANT
          <Link key={movie.imdbID} href={`/movie/${movie.imdbID}`}>
            
            <div className="bg-zinc-900 p-4 rounded-xl hover:scale-105 transition cursor-pointer">

              <Image
                src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
                alt={movie.Title}
                width={300}
                height={450}
                className="rounded-xl"
              />

              <h3 className="mt-3 font-semibold">{movie.Title}</h3>
              <p className="text-sm text-zinc-400">{movie.Year}</p>

            </div>

          </Link>
        ))}
      </div>
    </div>
  )
}