import { getImageUrl } from "@/constants";
import type { Post } from "@/types";
import { GRID_COLS } from "./config";

export interface TilePosition {
  x: number;
  y: number;
}

export interface GridPost extends Post {
  gridX: number;
  gridY: number;
}

type TileKey = string; // "x,y"

const toKey = (x: number, y: number): TileKey => `${x},${y}`;

export class TileLoader {
  private imageCache = new Map<TileKey, ImageBitmap>();
  private loadingSet = new Set<TileKey>();
  private abortControllers = new Map<TileKey, AbortController>();
  private postMap = new Map<TileKey, GridPost>();

  // Fetch queue
  private fetchQueue: TileKey[] = [];
  private activeImageFetches = 0;
  private readonly maxConcurrent = 6;

  // Post pagination state
  private allPosts: GridPost[] = [];
  private fetchedAll = false;
  private nextCursor: string | null = null;
  private isFetchingPosts = false;

  private apiUrl: string;
  onTileLoaded: ((key: TileKey) => void) | null = null;
  onPostsLoaded: (() => void) | null = null;
  onProgress: ((loaded: number, total: number) => void) | null = null;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  // --- Post fetching ---

  async fetchAllPosts(): Promise<void> {
    if (this.fetchedAll || this.isFetchingPosts) return;
    this.isFetchingPosts = true;

    try {
      while (true) {
        const url = this.nextCursor
          ? `${this.apiUrl}/posts?cursor=${encodeURIComponent(this.nextCursor)}&limit=100`
          : `${this.apiUrl}/posts?limit=100`;

        const res = await fetch(url);
        if (!res.ok) break;

        const data = await res.json();
        if (!data.success || !data.data) break;

        const batch: Post[] = data.data;
        const offset = this.allPosts.length;

        for (let i = 0; i < batch.length; i++) {
          const post = batch[i];
          const idx = offset + i;
          const gridX = idx % GRID_COLS;
          const gridY = Math.floor(idx / GRID_COLS);
          const gp: GridPost = { ...post, gridX, gridY };
          this.allPosts.push(gp);
          this.postMap.set(toKey(gridX, gridY), gp);
        }

        this.onPostsLoaded?.();

        if (!data.has_more || !data.next_cursor) {
          this.fetchedAll = true;
          break;
        }
        this.nextCursor = data.next_cursor;
      }
    } finally {
      this.isFetchingPosts = false;
    }
  }

  getPost(x: number, y: number): GridPost | undefined {
    return this.postMap.get(toKey(x, y));
  }

  getTotalPosts(): number {
    return this.allPosts.length;
  }

  // --- Image loading ---

  getImage(x: number, y: number): ImageBitmap | undefined {
    return this.imageCache.get(toKey(x, y));
  }

  isLoading(x: number, y: number): boolean {
    return this.loadingSet.has(toKey(x, y));
  }

  requestTile(x: number, y: number): void {
    const key = toKey(x, y);
    if (this.imageCache.has(key) || this.loadingSet.has(key)) return;
    const post = this.postMap.get(key);
    if (!post) return;

    if (!this.fetchQueue.includes(key)) {
      this.fetchQueue.unshift(key); // prioritize recent requests
      this.drainQueue();
    }
  }

  abortTile(x: number, y: number): void {
    const key = toKey(x, y);
    const idx = this.fetchQueue.indexOf(key);
    if (idx !== -1) this.fetchQueue.splice(idx, 1);

    const ctrl = this.abortControllers.get(key);
    if (ctrl) {
      ctrl.abort();
      this.abortControllers.delete(key);
      this.loadingSet.delete(key);
    }
  }

  private drainQueue(): void {
    while (
      this.activeImageFetches < this.maxConcurrent &&
      this.fetchQueue.length > 0
    ) {
      const key = this.fetchQueue.shift()!;
      if (this.imageCache.has(key) || this.loadingSet.has(key)) continue;
      this.loadTile(key);
    }
  }

  private async loadTile(key: TileKey): Promise<void> {
    const post = this.postMap.get(key);
    if (!post) return;

    const ctrl = new AbortController();
    this.abortControllers.set(key, ctrl);
    this.loadingSet.add(key);
    this.activeImageFetches++;

    try {
      const imageUrl = getImageUrl(post.pathname);
      const res = await fetch(imageUrl, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      this.imageCache.set(key, bitmap);
      this.onTileLoaded?.(key);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.warn(`Failed to load tile ${key}:`, err);
      }
    } finally {
      this.loadingSet.delete(key);
      this.abortControllers.delete(key);
      this.activeImageFetches--;
      this.drainQueue();
    }
  }

  // Request visible tiles and abort out-of-viewport ones
  updateViewport(visibleKeys: Set<TileKey>): void {
    // Abort tiles that left viewport and aren't cached
    for (const key of this.loadingSet) {
      if (!visibleKeys.has(key)) {
        const [x, y] = key.split(",").map(Number);
        this.abortTile(x, y);
      }
    }
    for (const key of this.fetchQueue) {
      if (!visibleKeys.has(key)) {
        const idx = this.fetchQueue.indexOf(key);
        if (idx !== -1) this.fetchQueue.splice(idx, 1);
      }
    }

    // Request visible tiles
    for (const key of visibleKeys) {
      const [x, y] = key.split(",").map(Number);
      this.requestTile(x, y);
    }
  }

  getViewportProgress(visibleKeys: Set<TileKey>): {
    loaded: number;
    total: number;
  } {
    let loaded = 0;
    for (const key of visibleKeys) {
      if (this.imageCache.has(key)) loaded++;
    }
    return { loaded, total: visibleKeys.size };
  }

  getCachedKeys(): Set<TileKey> {
    return new Set(this.imageCache.keys());
  }

  destroy(): void {
    for (const ctrl of this.abortControllers.values()) {
      ctrl.abort();
    }
    for (const bmp of this.imageCache.values()) {
      bmp.close();
    }
    this.imageCache.clear();
    this.abortControllers.clear();
    this.loadingSet.clear();
    this.fetchQueue.length = 0;
  }
}
