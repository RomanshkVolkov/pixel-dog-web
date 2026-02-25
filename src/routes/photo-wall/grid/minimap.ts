import { GRID_COLS, GRID_ROWS } from "./config";
import type { ViewState } from "./grid-renderer";
import type { TileLoader } from "./tile-loader";

const MINIMAP_SIZE = 200;

export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private loader: TileLoader;

  constructor(canvas: HTMLCanvasElement, loader: TileLoader) {
    this.canvas = canvas;
    this.canvas.width = MINIMAP_SIZE;
    this.canvas.height = MINIMAP_SIZE;
    this.ctx = canvas.getContext("2d")!;
    this.loader = loader;
  }

  draw(view: ViewState, canvasW: number, canvasH: number): void {
    const { ctx } = this;
    const size = MINIMAP_SIZE;

    // Background
    ctx.fillStyle = "rgba(26, 16, 8, 0.9)";
    ctx.fillRect(0, 0, size, size);

    // Scale: map full grid into minimap
    const scaleX = size / GRID_COLS;
    const scaleY = size / GRID_ROWS;

    // Draw loaded (cached) tiles as dots
    const cachedKeys = this.loader.getCachedKeys();
    ctx.fillStyle = "#c97b2f";
    for (const key of cachedKeys) {
      const [x, y] = key.split(",").map(Number);
      const mx = x * scaleX;
      const my = y * scaleY;
      // At this scale each cell is <1px, fill a pixel
      ctx.fillRect(mx, my, Math.max(1, scaleX), Math.max(1, scaleY));
    }

    // Draw all known posts as faint dots
    const totalPosts = this.loader.getTotalPosts();
    if (totalPosts > 0) {
      ctx.fillStyle = "rgba(201, 123, 47, 0.2)";
      for (let i = 0; i < totalPosts; i++) {
        const gx = i % GRID_COLS;
        const gy = Math.floor(i / GRID_COLS);
        const mx = gx * scaleX;
        const my = gy * scaleY;
        ctx.fillRect(mx, my, Math.max(1, scaleX), Math.max(1, scaleY));
      }
    }

    // Draw viewport rectangle
    const cellSize = 64 * view.zoom;
    const vpX0 = -view.offsetX / cellSize;
    const vpY0 = -view.offsetY / cellSize;
    const vpW = canvasW / cellSize;
    const vpH = canvasH / cellSize;

    const rx = vpX0 * scaleX;
    const ry = vpY0 * scaleY;
    const rw = vpW * scaleX;
    const rh = vpH * scaleY;

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.max(0, rx),
      Math.max(0, ry),
      Math.min(size - Math.max(0, rx), rw),
      Math.min(size - Math.max(0, ry), rh),
    );

    // Border
    ctx.strokeStyle = "rgba(201, 123, 47, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);
  }
}
