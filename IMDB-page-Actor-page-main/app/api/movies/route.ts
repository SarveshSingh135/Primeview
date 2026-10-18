
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get("q")?.trim() || "";
  const page = Number(searchParams.get("page") || "1");

  if (!query) {
    return NextResponse.json(
      { error: "Please enter a movie title." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(page) || page < 1 || page > 500) {
    return NextResponse.json(
      { error: "Invalid page number." },
      { status: 400 }
    );
  }

  const apiKey = process.env.TMDB_API_KEY;
  const accessToken = process.env.TMDB_ACCESS_TOKEN;

  if (!apiKey && !accessToken) {
    return NextResponse.json(
      { error: "TMDB credentials missing. Check .env.local." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "https://api.themoviedb.org/3/search/movie"
    );

    url.searchParams.set("query", query);
    url.searchParams.set("page", String(page));
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");

    // Use the v4 Read Access Token if available.
    // Otherwise, use the v3 API key as a query parameter.
    if (!accessToken && apiKey) {
      url.searchParams.set("api_key", apiKey);
    }

    const response = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.status_message ||
            "TMDB movie search failed.",
        },
        { status: response.status }
      );
    }

    const movies = (data.results || []).map(
      (movie: {
        id: number;
        title?: string;
        original_title?: string;
        release_date?: string;
        poster_path?: string | null;
        overview?: string;
        vote_average?: number;
      }) => ({
        imdbID: String(movie.id),
        Title:
          movie.title || movie.original_title || "Untitled",
        Year: movie.release_date
          ? movie.release_date.slice(0, 4)
          : "N/A",
        Poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "",
        overview: movie.overview || "",
        rating: movie.vote_average ?? 0,
        tmdbId: movie.id,
      })
    );

    return NextResponse.json({
      Search: movies,
      totalResults: data.total_results || 0,
      totalPages: Math.min(data.total_pages || 0, 500),
      page: data.page || page,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not connect to TMDB. Please try again." },
      { status: 502 }
    );
  }
}
