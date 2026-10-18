
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import { useTheme } from "@/context/ThemeContext";

type Movie = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  overview?: string;
  rating?: number;
  tmdbId?: number;
};

type MovieResponse = {
  Search: Movie[];
  totalResults: number;
  totalPages: number;
  page: number;
};

type HomeMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
};

type Video = {
  key: string;
  name: string;
  site: string;
  type: string;
};

type HomeData = {
  trending: HomeMovie[];
  upcoming: HomeMovie[];
  trailers: {
    movie: HomeMovie;
    video: Video;
  }[];
};

const posterUrl = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : null;

const backdropUrl = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/original${path}` : null;

export default function HomePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    setSearch(initialQuery);
    setQuery(initialQuery);
  }, []);

  // Trending movies, upcoming releases and trailers
  const {
    data: homeData,
    isLoading: homeLoading,
    error: homeError,
  } = useQuery<HomeData>({
    queryKey: ["primeview-home"],
    queryFn: async () => {
      const response = await fetch("/api/home");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load movies.");
      }

      return result;
    },
    enabled: mounted,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Movie search
  const { data, isLoading, error } = useQuery<MovieResponse>({
    queryKey: ["primeview-search", query, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
      });

      const response = await fetch(`/api/movies?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Movie search failed.");
      }

      return result;
    },
    enabled: mounted && query.trim().length > 0,
    retry: 1,
  });

  // Sync search with the URL
  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      const trimmed = search.trim();

      if (trimmed !== query) {
        setPage(1);
        setQuery(trimmed);

        router.replace(
          trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/",
          { scroll: false }
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, query, router, mounted]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = search.trim();

    setPage(1);
    setQuery(trimmed);

    router.replace(
      trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/",
      { scroll: false }
    );
  };

  // Use up to six real TMDB backdrops for the hero slideshow.
  // Keep all hooks above the conditional render below.
  const heroSlides = (homeData?.trending ?? [])
    .filter((movie) => Boolean(movie.backdrop_path))
    .slice(0, 6);

  useEffect(() => {
    setActiveSlide(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const featuredMovie = heroSlides[activeSlide];
  const showHome = !query.trim();

  if (!mounted) return null;

  const MovieRail = ({
    title,
    subtitle,
    movies,
    id,
  }: {
    title: string;
    subtitle: string;
    movies: HomeMovie[];
    id: string;
  }) => (
    <section id={id} className="mb-14 scroll-mt-28">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>

      {movies.length === 0 ? (
        <p className="rounded-xl border border-white/10 p-5 text-sm text-gray-400">
          Movies are not available right now.
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {movies.map((movie) => (
            <Link
              href={`/movie/${movie.id}`}
              key={movie.id}
              className="group w-40 flex-none sm:w-48"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-[#17181d]">
                {posterUrl(movie.poster_path) ? (
                  <img
                    src={posterUrl(movie.poster_path)!}
                    alt={movie.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-3 text-center text-sm text-gray-500">
                    No poster available
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 rounded-lg bg-black/75 px-2 py-1 text-xs font-bold text-yellow-400">
                  ★ {Number(movie.vote_average || 0).toFixed(1)}
                </div>
              </div>

              <h3 className="mt-3 line-clamp-2 font-bold transition group-hover:text-yellow-400">
                {movie.title}
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                {movie.release_date || "Release date unavailable"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090c] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#08090c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-tight">
            <span className="text-yellow-400">Prime</span>View
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-full border border-white/15 px-3 py-2 text-sm transition hover:border-yellow-400 hover:text-yellow-400"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
              <span className="hidden sm:inline"> Theme</span>
            </button>

            <Link
              href="/watchlist"
              className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 sm:px-5"
            >
              Watchlist
            </Link>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#08090c]">
        {/* Automatic cinematic slideshow: up to six TMDB backdrops */}
        <div className="absolute inset-0 -z-20 overflow-hidden bg-[#08090c]">
          {heroSlides.map((movie, index) => (
            <div
              key={movie.id}
              aria-hidden="true"
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
              }}
            />
          ))}
        </div>

        {/* Dark overlay keeps the text readable */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090c] via-[#08090c]/85 to-[#08090c]/50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08090c] via-transparent to-black/30" />

        {/* Golden glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(250,204,21,0.18),transparent_65%)]" />

        <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8 lg:pb-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
              Your Movie Universe
            </span>

            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Discover Your
              <span className="mt-2 block text-yellow-400">
                Next Favourite
              </span>
              Movie.
            </h1>

            {featuredMovie ? (
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-200">
                <span className="font-semibold">
                  Featured: {featuredMovie.title}
                </span>
                {featuredMovie.release_date && (
                  <span className="text-gray-400">
                    {featuredMovie.release_date.slice(0, 4)}
                  </span>
                )}
                {typeof featuredMovie.vote_average === "number" && (
                  <span className="rounded-md bg-black/50 px-2 py-1 text-yellow-400">
                    ★ {featuredMovie.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            ) : null}

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
              Discover trending hits, explore upcoming releases, and watch
              movie trailers — all in one place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#trending"
                className="rounded-xl bg-yellow-400 px-6 py-3.5 font-bold text-black shadow-lg shadow-yellow-400/20 transition hover:-translate-y-0.5 hover:bg-yellow-300"
              >
                Explore Trending →
              </a>

              <a
                href="#trailers"
                className="rounded-xl border border-white/25 bg-black/40 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition hover:border-yellow-400 hover:text-yellow-400"
              >
                ▶ Watch Trailers
              </a>
            </div>

            {/* Clickable slideshow indicators */}
            {heroSlides.length > 1 && (
              <div className="mt-6 flex items-center gap-2" aria-label="Hero slideshow controls">
                {heroSlides.map((movie, index) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show slide ${index + 1}`}
                    aria-pressed={index === activeSlide}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeSlide
                        ? "w-10 bg-yellow-400"
                        : "w-4 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs text-gray-400">
                  {activeSlide + 1} / {heroSlides.length}
                </span>
              </div>
            )}
          </div>

          {/* Search */}
          <form
            id="movie-search"
            onSubmit={handleSearch}
            className="mx-auto mt-12 flex max-w-4xl scroll-mt-28 flex-col gap-3 rounded-2xl border border-white/15 bg-[#111114]/90 p-3 shadow-2xl backdrop-blur-xl sm:flex-row"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <span className="text-xl text-yellow-400">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search movies, e.g. Inception..."
                aria-label="Search movies"
                className="min-w-0 flex-1 bg-transparent py-3 text-white outline-none placeholder:text-gray-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-yellow-400 px-7 py-3.5 font-bold text-black transition hover:bg-yellow-300"
            >
              Search Movies →
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {showHome ? (
          <>
            {homeLoading ? (
              <div className="space-y-10">
                {[1, 2, 3].map((section) => (
                  <div key={section}>
                    <div className="mb-4 h-7 w-56 animate-pulse rounded bg-white/10" />
                    <div className="flex gap-4 overflow-hidden">
                      {[1, 2, 3, 4, 5, 6].map((card) => (
                        <div
                          key={card}
                          className="aspect-[2/3] w-40 flex-none animate-pulse rounded-2xl bg-white/10 sm:w-48"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : homeData ? (
              <>
                <MovieRail
                  id="trending"
                  title="🔥 Trending This Week"
                  subtitle="Movies everyone is talking about"
                  movies={homeData.trending}
                />

                <MovieRail
                  id="upcoming"
                  title="🎬 Coming Soon"
                  subtitle="Your next big-screen discoveries"
                  movies={homeData.upcoming}
                />

                <section id="trailers" className="mb-14 scroll-mt-28">
                  <h2 className="text-2xl font-black sm:text-3xl">
                    ▶ Latest Trailers
                  </h2>
                  <p className="mb-5 mt-1 text-sm text-gray-400">
                    Watch official movie previews
                  </p>

                  {homeData.trailers.length === 0 ? (
                    <p className="rounded-xl border border-white/10 p-5 text-sm text-gray-400">
                      No trailers are available right now.
                    </p>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {homeData.trailers.map(({ movie, video }) => (
                        <a
                          key={`${movie.id}-${video.key}`}
                          href={`https://www.youtube.com/watch?v=${video.key}`}
                          target="_blank"
                          rel="noreferrer"
                          className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-yellow-400/50"
                        >
                          <div className="relative aspect-video overflow-hidden bg-[#17181d]">
                            <img
                              src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                              alt={`${movie.title} trailer`}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-2xl text-black shadow-xl transition group-hover:scale-110">
                                ▶
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                              {video.type}
                            </p>
                            <h3 className="mt-1 font-bold">{movie.title}</h3>
                            <p className="mt-1 text-sm text-gray-400">
                              {video.name}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <p className="rounded-xl border border-red-500/20 p-5 text-sm text-red-300">
                {homeError instanceof Error
                  ? homeError.message
                  : "Could not load movies. Check your TMDB configuration."}
              </p>
            )}
          </>
        ) : (
          <section>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Search Results
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Results for &quot;{query}&quot;
                </p>
              </div>

              {data && (
                <span className="text-sm text-gray-400">
                  {data.totalResults.toLocaleString()} results
                </span>
              )}
            </div>

            {isLoading && (
              <p className="py-10 text-center text-gray-400">
                Loading movies...
              </p>
            )}

            {error && !isLoading && (
              <p className="rounded-xl border border-red-500/20 p-5 text-red-400">
                {error instanceof Error ? error.message : "Search failed."}
              </p>
            )}

            {data && !isLoading && data.Search.length === 0 && (
              <p className="rounded-xl border border-white/10 p-8 text-center text-gray-400">
                No movies found. Try another title.
              </p>
            )}

            {data && data.Search.length > 0 && !isLoading && (
              <>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {data.Search.map((movie) => (
                    <div
                      key={movie.tmdbId ?? movie.imdbID}
                      className="min-w-0"
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>

                {data.totalPages > 1 && (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                    <button
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:border-yellow-400 disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <span className="text-sm text-gray-400">
                      Page {page} of {data.totalPages}
                    </span>

                    <button
                      disabled={page >= data.totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(data.totalPages, current + 1)
                        )
                      }
                      className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:border-yellow-400 disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8 text-center">
        <Link href="/" className="text-xl font-black">
          <span className="text-yellow-400">Prime</span>View
        </Link>

        <p className="mt-3 text-xs leading-6 text-gray-500">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>

        <p className="mt-2 text-xs text-gray-600">
          © {new Date().getFullYear()} PrimeView
        </p>
      </footer>
    </main>
  );
}
