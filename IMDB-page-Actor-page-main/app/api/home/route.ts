
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  const accessToken = process.env.TMDB_ACCESS_TOKEN;

  if (!apiKey && !accessToken) {
    return NextResponse.json(
      { error: "TMDB credentials missing in .env.local" },
      { status: 500 }
    );
  }

  const headers: HeadersInit = {
    accept: "application/json",
    ...(accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {}),
  };

  async function tmdb(path: string) {
    const url = new URL(`https://api.themoviedb.org/3${path}`);

    if (!accessToken && apiKey) {
      url.searchParams.set("api_key", apiKey);
    }

    const response = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.status_message || "TMDB request failed"
      );
    }

    return data;
  }

  try {
    const [trendingData, upcomingData] = await Promise.all([
      tmdb("/trending/movie/week?language=en-US"),
      tmdb("/movie/upcoming?language=en-US&page=1"),
    ]);

    const trending = (trendingData.results || []).slice(0, 12);
    const upcoming = (upcomingData.results || []).slice(0, 12);

    // Fetch official YouTube trailers for a few trending movies.
    const trailerResults = await Promise.all(
      trending.slice(0, 8).map(async (movie: { id: number }) => {
        try {
          const videoData = await tmdb(
            `/movie/${movie.id}/videos?language=en-US`
          );

          const videos = videoData.results || [];

          const trailer =
            videos.find(
              (video: {
                site: string;
                type: string;
                official?: boolean;
              }) =>
                video.site === "YouTube" &&
                video.type === "Trailer" &&
                video.official === true
            ) ||
            videos.find(
              (video: { site: string; type: string }) =>
                video.site === "YouTube" &&
                video.type === "Trailer"
            );

          return trailer ? { movie, video: trailer } : null;
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      trending,
      upcoming,
      trailers: trailerResults.filter(Boolean),
    });
  } catch (error) {
    console.error("PrimeView homepage API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load homepage movies.",
      },
      { status: 502 }
    );
  }
}
