import { GRID_COLS, GRID_ROWS, MAX_ZOOM, MIN_ZOOM } from "./config";
import type { TileLoader } from "./tile-loader";

export interface ViewState {
  offsetX: number; // pan in world coords
  offsetY: number;
  zoom: number; // pixels per cell
}

const CELL_BASE = 64;

const PLACEHOLDER_COLORS = [
  "#c97b2f",
  "#a85c20",
  "#d4924a",
  "#b87333",
  "#8b5e3c",
  "#cd853f",
  "#daa520",
  "#c8860a",
];

function placeholderColor(x: number, y: number): string {
  return PLACEHOLDER_COLORS[(x * 31 + y * 17) % PLACEHOLDER_COLORS.length];
}

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private loader: TileLoader;
  private rafId = 0;
  private dirty = true;

  view: ViewState = { offsetX: 0, offsetY: 0, zoom: MIN_ZOOM };

  // Interaction state
  private isPanning = false;
  private lastPointer = { x: 0, y: 0 };
  private pinchDist = 0;

  onViewChange: ((view: ViewState) => void) | null = null;
  onVisibleKeysChange: ((keys: Set<string>) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, loader: TileLoader) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.loader = loader;
    this.bindEvents();
    this.startLoop();
  }

  private get cellSize(): number {
    return CELL_BASE * this.view.zoom;
  }

  // Convert canvas coords → world cell
  canvasToCell(cx: number, cy: number): { x: number; y: number } {
    const cs = this.cellSize;
    return {
      x: Math.floor(cx / cs - this.view.offsetX / cs),
      y: Math.floor(cy / cs - this.view.offsetY / cs),
    };
  }

  // Convert world cell → canvas coords (top-left of cell)
  cellToCanvas(gx: number, gy: number): { x: number; y: number } {
    const cs = this.cellSize;
    return {
      x: gx * cs + this.view.offsetX,
      y: gy * cs + this.view.offsetY,
    };
  }

  getVisibleCellRange(): { x0: number; y0: number; x1: number; y1: number } {
    const cs = this.cellSize;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const x0 = Math.max(0, Math.floor(-this.view.offsetX / cs) - 1);
    const y0 = Math.max(0, Math.floor(-this.view.offsetY / cs) - 1);
    const x1 = Math.min(
      GRID_COLS - 1,
      Math.ceil((w - this.view.offsetX) / cs) + 1,
    );
    const y1 = Math.min(
      GRID_ROWS - 1,
      Math.ceil((h - this.view.offsetY) / cs) + 1,
    );

    return { x0, y0, x1, y1 };
  }

  private getVisibleKeys(): Set<string> {
    const { x0, y0, x1, y1 } = this.getVisibleCellRange();
    const keys = new Set<string>();
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        // Only request tiles that have posts
        if (this.loader.getPost(x, y)) {
          keys.add(`${x},${y}`);
        }
      }
    }
    return keys;
  }

  markDirty(): void {
    this.dirty = true;
  }

  private startLoop(): void {
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);
      if (!this.dirty) return;
      this.dirty = false;
      this.draw();
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private draw(): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const cs = this.cellSize;
    const zoom = this.view.zoom;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(0, 0, w, h);

    const { x0, y0, x1, y1 } = this.getVisibleCellRange();
    const showGridLines = zoom >= 0.3;
    const showOverlay = zoom > 2;

    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const px = gx * cs + this.view.offsetX;
        const py = gy * cs + this.view.offsetY;

        const post = this.loader.getPost(gx, gy);
        if (!post) continue;

        const bitmap = this.loader.getImage(gx, gy);

        if (bitmap) {
          ctx.drawImage(bitmap, px, py, cs, cs);
        } else {
          // Placeholder colored square
          ctx.fillStyle = placeholderColor(gx, gy);
          ctx.fillRect(px, py, cs, cs);

          // Loading spinner hint (only at reasonable zoom)
          if (zoom > 0.5 && this.loader.isLoading(gx, gy)) {
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(px, py, cs, cs);
          }
        }

        // Grid lines
        if (showGridLines) {
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, cs, cs);
        }

        // Title overlay at high zoom
        if (showOverlay && post.description) {
          const label = post.description.slice(0, 20);
          const fontSize = Math.max(8, Math.min(14, cs * 0.12));
          ctx.font = `${fontSize}px system-ui, sans-serif`;
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(px, py + cs - fontSize * 1.6, cs, fontSize * 1.6);
          ctx.fillStyle = "#fff";
          ctx.fillText(label, px + 2, py + cs - fontSize * 0.4);
        }
      }
    }

    // Notify visible keys for tile loading
    const visible = this.getVisibleKeys();
    this.onVisibleKeysChange?.(visible);
    this.onViewChange?.(this.view);
  }

  // --- Pan & Zoom ---

  panBy(dx: number, dy: number): void {
    this.view.offsetX += dx;
    this.view.offsetY += dy;
    this.dirty = true;
  }

  zoomAt(cx: number, cy: number, factor: number): void {
    const newZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, this.view.zoom * factor),
    );
    const scale = newZoom / this.view.zoom;

    // Zoom toward cursor point
    this.view.offsetX = cx - scale * (cx - this.view.offsetX);
    this.view.offsetY = cy - scale * (cy - this.view.offsetY);
    this.view.zoom = newZoom;
    this.dirty = true;
  }

  jumpToCell(gx: number, gy: number): void {
    const cs = this.cellSize;
    this.view.offsetX = this.canvas.width / 2 - gx * cs - cs / 2;
    this.view.offsetY = this.canvas.height / 2 - gy * cs - cs / 2;
    this.dirty = true;
  }

  resize(w: number, h: number): void {
    this.canvas.width = w;
    this.canvas.height = h;
    this.dirty = true;
  }

  // --- Event binding ---

  private bindEvents(): void {
    const el = this.canvas;

    // Mouse
    el.addEventListener("mousedown", this.onMouseDown);
    el.addEventListener("mousemove", this.onMouseMove);
    el.addEventListener("mouseup", this.onMouseUp);
    el.addEventListener("mouseleave", this.onMouseUp);
    el.addEventListener("wheel", this.onWheel, { passive: false });

    // Touch
    el.addEventListener("touchstart", this.onTouchStart, { passive: false });
    el.addEventListener("touchmove", this.onTouchMove, { passive: false });
    el.addEventListener("touchend", this.onTouchEnd);
  }

  private onMouseDown = (e: MouseEvent): void => {
    this.isPanning = true;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.canvas.style.cursor = "grabbing";
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isPanning) return;
    this.panBy(e.clientX - this.lastPointer.x, e.clientY - this.lastPointer.y);
    this.lastPointer = { x: e.clientX, y: e.clientY };
  };

  private onMouseUp = (): void => {
    this.isPanning = false;
    this.canvas.style.cursor = "grab";
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.zoomAt(cx, cy, factor);
  };

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.isPanning = true;
      this.lastPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      this.isPanning = false;
      this.pinchDist = this.getTouchDist(e.touches);
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 1 && this.isPanning) {
      const dx = e.touches[0].clientX - this.lastPointer.x;
      const dy = e.touches[0].clientY - this.lastPointer.y;
      this.panBy(dx, dy);
      this.lastPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dist = this.getTouchDist(e.touches);
      if (this.pinchDist > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const cx =
          (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        this.zoomAt(cx, cy, dist / this.pinchDist);
      }
      this.pinchDist = dist;
    }
  };

  private onTouchEnd = (): void => {
    this.isPanning = false;
    this.pinchDist = 0;
  };

  private getTouchDist(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    const el = this.canvas;
    el.removeEventListener("mousedown", this.onMouseDown);
    el.removeEventListener("mousemove", this.onMouseMove);
    el.removeEventListener("mouseup", this.onMouseUp);
    el.removeEventListener("mouseleave", this.onMouseUp);
    el.removeEventListener("wheel", this.onWheel);
    el.removeEventListener("touchstart", this.onTouchStart);
    el.removeEventListener("touchmove", this.onTouchMove);
    el.removeEventListener("touchend", this.onTouchEnd);
  }
}
