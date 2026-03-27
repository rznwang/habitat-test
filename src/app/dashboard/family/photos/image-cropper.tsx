"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface ImageCropperProps {
  src: string;
  aspectRatio?: number; // width / height, e.g. 4/5 = 0.8
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function ImageCropper({
  src,
  aspectRatio = 4 / 5,
  onCrop,
  onCancel,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Pinch state
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchZoom = useRef(1);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);

  // Clamp offset so image always covers the viewport
  const clampOffset = useCallback(
    (ox: number, oy: number, z: number) => {
      const container = containerRef.current;
      const img = imgRef.current;
      if (!container || !img) return { x: ox, y: oy };

      const cw = container.clientWidth;
      const ch = container.clientHeight;

      // Compute displayed image size (cover the container, then zoom)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = cw / ch;
      let drawW: number, drawH: number;
      if (imgAspect > containerAspect) {
        drawH = ch * z;
        drawW = drawH * imgAspect;
      } else {
        drawW = cw * z;
        drawH = drawW / imgAspect;
      }

      const maxX = Math.max(0, (drawW - cw) / 2);
      const maxY = Math.max(0, (drawH - ch) / 2);

      return {
        x: Math.max(-maxX, Math.min(maxX, ox)),
        y: Math.max(-maxY, Math.min(maxY, oy)),
      };
    },
    []
  );

  // Draw preview onto canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !container || !img) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, cw, ch);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = cw / ch;
    let drawW: number, drawH: number;
    if (imgAspect > containerAspect) {
      drawH = ch * zoom;
      drawW = drawH * imgAspect;
    } else {
      drawW = cw * zoom;
      drawH = drawW / imgAspect;
    }

    const dx = (cw - drawW) / 2 + offset.x;
    const dy = (ch - drawH) / 2 + offset.y;

    ctx.drawImage(img, dx, dy, drawW, drawH);
  }, [zoom, offset]);

  useEffect(() => {
    if (imageLoaded) draw();
  }, [imageLoaded, draw]);

  // Mouse / touch handlers for pan
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // handled by touch events
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || e.pointerType === "touch") return;
    const newOffset = clampOffset(
      e.clientX - dragStart.x,
      e.clientY - dragStart.y,
      zoom
    );
    setOffset(newOffset);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  // Touch handlers for pan + pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastPinchZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      const newOffset = clampOffset(
        e.touches[0].clientX - dragStart.x,
        e.touches[0].clientY - dragStart.y,
        zoom
      );
      setOffset(newOffset);
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / lastPinchDist.current;
      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, lastPinchZoom.current * scale)
      );
      setZoom(newZoom);
      setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    lastPinchDist.current = null;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
  };

  const handleZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
  };

  // Export cropped image
  const handleCrop = () => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    setExporting(true);

    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // Render at higher resolution for quality
    const scale = Math.min(2, img.naturalWidth / cw, img.naturalHeight / ch);
    const outW = Math.round(cw * scale);
    const outH = Math.round(ch * scale);

    const offscreen = document.createElement("canvas");
    offscreen.width = outW;
    offscreen.height = outH;
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      setExporting(false);
      return;
    }

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = cw / ch;
    let drawW: number, drawH: number;
    if (imgAspect > containerAspect) {
      drawH = ch * zoom;
      drawW = drawH * imgAspect;
    } else {
      drawW = cw * zoom;
      drawH = drawW / imgAspect;
    }

    const dx = ((cw - drawW) / 2 + offset.x) * scale;
    const dy = ((ch - drawH) / 2 + offset.y) * scale;

    ctx.drawImage(img, dx, dy, drawW * scale, drawH * scale);

    offscreen.toBlob(
      (blob) => {
        setExporting(false);
        if (blob) onCrop(blob);
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-night/80">
        <button
          type="button"
          onClick={onCancel}
          className="text-[14px] font-medium text-cream/80 hover:text-cream transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <span className="text-[14px] font-semibold text-cream">
          Adjust Photo
        </span>
        <button
          type="button"
          onClick={handleCrop}
          disabled={!imageLoaded || exporting}
          className="text-[14px] font-semibold text-sage hover:text-mist transition-colors disabled:opacity-50 cursor-pointer"
        >
          {exporting ? "Saving…" : "Done"}
        </button>
      </div>

      {/* Crop area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-[16px] border-2 border-cream/20 bg-night touch-none select-none"
          style={{
            width: "100%",
            maxWidth: 400,
            aspectRatio: String(aspectRatio),
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: dragging ? "grabbing" : "grab" }}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-cream/60 text-sm">Loading…</span>
            </div>
          )}
        </div>
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 px-6 pb-6 pt-2 justify-center">
        <span className="text-cream/60 text-xs">−</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={handleZoomSlider}
          className="w-48 accent-sage"
        />
        <span className="text-cream/60 text-xs">+</span>
      </div>

      {/* Helper text */}
      <p className="text-center text-cream/40 text-[12px] pb-4">
        Drag to reposition · Pinch or scroll to zoom
      </p>
    </div>
  );
}
