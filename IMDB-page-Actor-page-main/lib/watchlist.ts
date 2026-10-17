import { openDB } from "idb"

const DB_NAME = "movie-db"
const STORE_NAME = "watchlist"

// 🔌 DB init
async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "imdbID" })
      }
    },
  })
}

type Movie = {
  imdbID: string
  Title: string
  Poster: string
  Year: string
}

export function getWatchlist() {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem("watchlist");
  return data ? JSON.parse(data) : [];
}

export function addToWatchlist(movie: any) {
  const list = getWatchlist();

  const exists = list.some((m: any) => m.imdbID === movie.imdbID);

  if (!exists) {
    const updated = [...list, movie];
    localStorage.setItem("watchlist", JSON.stringify(updated));
  }
}

export function removeFromWatchlist(id: string) {
  const list = getWatchlist();
  const updated = list.filter((m: any) => m.imdbID !== id);

  localStorage.setItem("watchlist", JSON.stringify(updated));
}

export function isInWatchlist(id: string) {
  const list = getWatchlist();
  return list.some((m: any) => m.imdbID === id);
}