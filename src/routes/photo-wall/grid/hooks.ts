import { useCallback, useEffect, useRef, useState } from "react";
import { POST_API_URL } from "@/constants";
import type { ViewState } from "./grid-renderer";
import { GridRenderer } from "./grid-renderer";
import { Minimap } from "./minimap";
import { TileLoader } from "./tile-loader";

interface UseGridOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  minimapRef: React.RefObject<HTMLCanvasElement | null>;
}

interface GridState {
  zoom: number;
  totalPosts: number;
  viewportProgress: { loaded: number; total: number };
}

export function useGrid({ canvasRef, minimapRef }: UseGridOptions) {
  const loaderRef = useRef<TileLoader | null>(null);
  const rendererRef = useRef<GridRenderer | null>(null);
  const minimapRef2 = useRef<Minimap | null>(null);
  const minimapRafRef = useRef<number>(0);

  const [state, setState] = useState<GridState>({
    zoom: 1,
    totalPosts: 0,
    viewportProgress: { loaded: 0, total: 0 },
  });

  const jumpToCell = useCallback((input: string) => {
    const parts = input.split(",").map((s) => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      rendererRef.current?.jumpToCell(parts[0], parts[1]);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const minimapCanvas = minimapRef.current;
    if (!canvas || !minimapCanvas) return;

    // Init loader
    const loader = new TileLoader(POST_API_URL);
    loaderRef.current = loader;

    // Init renderer
    const renderer = new GridRenderer(canvas, loader);
    rendererRef.current = renderer;

    // Init minimap
    const minimap = new Minimap(minimapCanvas, loader);
    minimapRef2.current = minimap;

    // Resize canvas to fill parent
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.resize(width, height);
      }
    });
    resizeObserver.observe(canvas.parentElement ?? canvas);
    renderer.resize(
      canvas.offsetWidth || window.innerWidth,
      canvas.offsetHeight || window.innerHeight,
    );

    // Callbacks
    loader.onPostsLoaded = () => {
      renderer.markDirty();
      setState((s) => ({ ...s, totalPosts: loader.getTotalPosts() }));
    };

    loader.onTileLoaded = () => {
      renderer.markDirty();
    };

    renderer.onVisibleKeysChange = (keys) => {
      loader.updateViewport(keys);
      const progress = loader.getViewportProgress(keys);
      setState((s) => ({ ...s, viewportProgress: progress }));
    };

    renderer.onViewChange = (view: ViewState) => {
      setState((s) => ({ ...s, zoom: view.zoom }));
    };

    // Minimap RAF loop
    let lastView: ViewState = { ...renderer.view };
    const minimapLoop = () => {
      minimapRafRef.current = requestAnimationFrame(minimapLoop);
      const view = renderer.view;
      minimap.draw(view, canvas.width, canvas.height);
      lastView = view;
      void lastView; // suppress unused warning
    };
    minimapRafRef.current = requestAnimationFrame(minimapLoop);

    // Start fetching posts
    loader.fetchAllPosts();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(minimapRafRef.current);
      renderer.destroy();
      loader.destroy();
    };
  }, [canvasRef, minimapRef]);

  return { state, jumpToCell };
}
