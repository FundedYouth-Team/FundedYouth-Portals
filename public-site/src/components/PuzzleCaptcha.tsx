import { useEffect, useRef, useState, useCallback } from "react";

interface PuzzleCaptchaProps {
  onVerified: (token: string) => void;
  onReset?: () => void;
}

export function PuzzleCaptcha({ onVerified, onReset }: PuzzleCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  const [solved, setSolved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [piecePos, setPiecePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState("");

  const pieceSize = 50;
  const tolerance = 8;

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const angle = Math.random() * Math.PI * 2;
    const x1 = width / 2 + Math.cos(angle) * width / 2;
    const y1 = height / 2 + Math.sin(angle) * height / 2;
    const x2 = width / 2 - Math.cos(angle) * width / 2;
    const y2 = height / 2 - Math.sin(angle) * height / 2;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

    const palettes = [
      ["#667eea", "#764ba2", "#f97316"],
      ["#11998e", "#38ef7d", "#3b82f6"],
      ["#fc466b", "#3f5efb", "#fbbf24"],
      ["#00c6ff", "#0072ff", "#f97316"],
      ["#f093fb", "#f5576c", "#4facfe"],
      ["#43e97b", "#38f9d7", "#667eea"],
    ];

    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(0.5, palette[1]);
    gradient.addColorStop(1, palette[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw circles
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 20 + Math.random() * 40;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(palette[Math.floor(Math.random() * palette.length)], 0.3);
      ctx.fill();
    }

    // Draw wavy lines
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = hexToRgba("#ffffff", 0.2 + Math.random() * 0.2);
      ctx.lineWidth = 2 + Math.random() * 3;
      const startY = Math.random() * height;
      ctx.moveTo(0, startY);
      for (let x = 0; x < width; x += 20) {
        const y = startY + Math.sin(x * 0.05 + i) * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw triangles
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 15 + Math.random() * 25;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x - size, y + size);
      ctx.closePath();
      ctx.fillStyle = hexToRgba("#ffffff", 0.15);
      ctx.fill();
    }

    // Draw dot pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let x = 0; x < width; x += 15) {
      for (let y = 0; y < height; y += 15) {
        if (Math.random() > 0.7) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, []);

  const generatePuzzle = useCallback(() => {
    setSolved(false);
    onReset?.();

    const newTargetX = 80 + Math.floor(Math.random() * 100);
    const newTargetY = 40 + Math.floor(Math.random() * 60);
    const newPieceX = 10 + Math.floor(Math.random() * 30);
    const newPieceY = 55 + Math.floor(Math.random() * 50);

    setTargetPos({ x: newTargetX, y: newTargetY });
    setPiecePos({ x: newPieceX, y: newPieceY });

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawBackground(ctx, canvas.width, canvas.height);
        setBackgroundImage(canvas.toDataURL());
      }
    }
  }, [drawBackground, onReset]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const hashCode = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  };

  const generateToken = useCallback(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    const secret = "fundedyouth-puzzle-captcha-2024";
    const data = timestamp + ":" + hashCode(timestamp + secret);
    const token = btoa(data);
    onVerified(token);
  }, [onVerified]);

  const solvePuzzle = useCallback(() => {
    setSolved(true);
    setPiecePos(targetPos);
    generateToken();
  }, [targetPos, generateToken]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (solved) return;
    e.preventDefault();
    setIsDragging(true);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left - piecePos.x,
        y: clientY - rect.top - piecePos.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || solved) return;
      e.preventDefault();

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        let newX = clientX - rect.left - dragOffset.x;
        let newY = clientY - rect.top - dragOffset.y;

        const maxX = container.offsetWidth - pieceSize;
        const maxY = container.offsetHeight - pieceSize;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        setPiecePos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (!isDragging || solved) return;
      setIsDragging(false);

      const deltaX = Math.abs(piecePos.x - targetPos.x);
      const deltaY = Math.abs(piecePos.y - targetPos.y);

      if (deltaX <= tolerance && deltaY <= tolerance) {
        solvePuzzle();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, solved, piecePos, targetPos, dragOffset, solvePuzzle]);

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <label className="block text-sm text-gray-600 mb-3 text-center font-medium">
        Verify you're human <span className="text-red-500">*</span>
      </label>

      <div
        ref={containerRef}
        className="relative w-[280px] h-[160px] mx-auto bg-slate-100 rounded-xl overflow-hidden select-none"
      >
        <canvas
          ref={canvasRef}
          width={280}
          height={160}
          className="w-full h-full object-cover brightness-95"
        />

        {/* Puzzle slot */}
        <div
          ref={slotRef}
          className={`absolute w-[50px] h-[50px] rounded-lg flex items-center justify-center transition-colors ${
            solved
              ? "border-2 border-green-500 bg-transparent"
              : "border-2 border-dashed border-white/60 bg-black/30"
          }`}
          style={{ left: targetPos.x, top: targetPos.y }}
        >
          {!solved && <span className="text-2xl text-white/50 font-bold">?</span>}
        </div>

        {/* Puzzle piece */}
        <div
          ref={pieceRef}
          className={`absolute w-[50px] h-[50px] rounded-lg transition-transform duration-100 z-10 ${
            solved
              ? "cursor-default shadow-[0_0_0_3px_#22c55e,0_4px_12px_rgba(34,197,94,0.4)]"
              : isDragging
                ? "cursor-grabbing scale-110 shadow-[0_8px_25px_rgba(0,0,0,0.5)] z-20"
                : "cursor-grab shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
          }`}
          style={{
            left: piecePos.x,
            top: piecePos.y,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "280px 160px",
            backgroundPosition: `-${targetPos.x}px -${targetPos.y}px`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        />
      </div>

      <p className="text-center text-sm text-gray-500 mt-3">
        Drag the puzzle piece to complete the image
      </p>

      <div
        className={`flex items-center justify-center gap-2 mt-2 text-sm font-medium ${
          solved ? "text-green-500" : "text-orange-500"
        }`}
      >
        {solved ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Verified!</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Move the piece to verify</span>
          </>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={generatePuzzle}
          className="text-blue-600 hover:text-blue-800 text-sm underline mt-2"
        >
          Generate new puzzle
        </button>
      </div>
    </div>
  );
}
