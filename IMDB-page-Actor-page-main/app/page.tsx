
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import { useTheme } from "@/context/ThemeContext";

export default function HomePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    setSearch(initialQuery);
    setQuery(initialQuery);
  }, []);

  const fetchMovies = async (term: string, currentPage: number) => {
    const apiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OMDb API key missing. Check your .env.local file."
      );
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      s: term,
      page: String(currentPage),
    });

    const response = await fetch(
      `https://www.omdbapi.com/?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Unable to fetch movies. Please try again.");
    }

    const data = await response.json();

    if (data.Response === "False") {
      throw new Error(data.Error || "No movies found.");
    }

    return data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: mounted && query.trim().length > 0,
    retry: 1,
  });

  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      const trimmed = search.trim();

      setPage(1);
      setQuery(trimmed);

      const url = trimmed
        ? `/?q=${encodeURIComponent(trimmed)}`
        : "/";

      router.replace(url, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, router, mounted]);

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

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090c]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            aria-label="PrimeView home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-xl text-black shadow-lg shadow-yellow-400/10">
              ▶
            </span>

            <span className="text-lg font-black tracking-tight sm:text-2xl">
              PRIME<span className="text-yellow-400">VIEW</span>
            </span>
          </Link>

          <div className="hidden text-sm text-gray-400 md:block">
            Your world of movies & actors
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <Link
              href="/watchlist"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-3 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300 sm:px-4"
            >
              <span>☆</span>
              <span>Watchlist</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#202016] via-[#14151a] to-[#0b0c10] p-6 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Discover something amazing
            </span>

            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Every movie has
              <br />
              a story. <span className="text-yellow-400">Find yours.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
              Explore movies, discover actors and build your own
              collection of films worth watching.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-7 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 transition focus-within:border-yellow-400/60">
                <span className="text-lg text-gray-400">⌕</span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search movies, e.g. Inception..."
                  aria-label="Search movies"
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-gray-500 sm:text-base"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setQuery("");
                      setPage(1);
                      router.replace("/");
                    }}
                    aria-label="Clear search"
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="rounded-xl bg-yellow-400 px-7 py-4 font-bold text-black transition hover:bg-yellow-300 active:scale-[0.98]"
              >
                Search Movies
              </button>
            </form>
          </div>
        </section>

        {/* Results heading */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">
                Movie collection
              </p>

              <h2 className="text-2xl font-bold sm:text-3xl">
                {query
                  ? `Results for "${query}"`
                  : "Find your next favourite"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {query
                  ? "Explore matching titles from the movie database."
                  : "Search for a movie to discover its details."}
              </p>
            </div>

            {data?.totalResults && (
              <span className="text-sm text-gray-400">
                {data.totalResults} results
              </span>
            )}
          </div>

          {/* Loading */}
          {query && isLoading && (
            <div
              role="status"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]"
                >
                  <div className="aspect-[2/3] bg-white/10" />
                  <div className="space-y-3 p-3">
                    <div className="h-4 rounded bg-white/10" />
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Loading movies...</span>
            </div>
          )}

          {/* Error */}
          {query && error && !isLoading && (
            <div
              role="alert"
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
            >
              <p className="font-semibold text-red-400">
                Unable to load movies
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {(error as Error).message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                Try again
              </button>
            </div>
          )}

          {/* Movie grid */}
          {query && !isLoading && !error && data?.Search && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
              {data.Search.map((movie: any) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          )}

          {/* No results */}
          {query && !isLoading && !error && !data?.Search && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-12 text-center">
              <div className="text-4xl">🎬</div>
              <h3 className="mt-4 text-xl font-bold">
                No movies found
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Try another movie title or check your spelling.
              </p>
            </div>
          )}

          {/* Initial empty state */}
          {!query && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center sm:py-14">
              <div className="text-4xl">🍿</div>
              <h3 className="mt-4 text-lg font-bold">
                Lights, camera, search!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                Enter a movie title in the search box above to discover
                posters, release years and more.
              </p>
            </div>
          )}

          {/* Pagination */}
          {query && !isLoading && !error && data?.Search && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-sm text-gray-400">
                Page {page}
              </span>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page * 10 >= Number(data.totalResults || 0)}
                className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 py-6 text-center text-xs text-gray-500">
          <p>
            <span className="font-bold text-gray-300">PRIMEVIEW</span>
            {" "}· Discover movies. Explore stories.
          </p>
          <p className="mt-2">
            Movie information provided through the OMDb API.
          </p>
        </footer>
      </div>
    </main>
  );
}
