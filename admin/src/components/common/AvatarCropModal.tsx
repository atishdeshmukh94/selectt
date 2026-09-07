import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Loader } from 'lucide-react';

interface AvatarCropModalProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => Promise<void>;
  onClose: () => void;
}

const AvatarCropModal: React.FC<AvatarCropModalProps> = ({ imageSrc, onConfirm, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);

  const SIZE = 320;
  const CROP_R = 130;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current.src) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imgRef.current;

    ctx.clearRect(0, 0, SIZE, SIZE);

    const scaledW = img.naturalWidth * zoom;
    const scaledH = img.naturalHeight * zoom;
    const x = SIZE / 2 - scaledW / 2 + pan.x;
    const y = SIZE / 2 - scaledH / 2 + pan.y;
    ctx.drawImage(img, x, y, scaledW, scaledH);

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, CROP_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, CROP_R, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, scaledW, scaledH);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, CROP_R, 0, Math.PI * 2);
    ctx.strokeStyle = '#1C3EB9';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }, [zoom, pan]);

  useEffect(() => {
    const img = imgRef.current;
    img.onload = () => {
      const scale = Math.max((CROP_R * 2) / img.naturalWidth, (CROP_R * 2) / img.naturalHeight);
      setZoom(scale);
      setPan({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => { draw(); }, [draw]);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setIsDragging(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - pan.x, y: t.clientY - pan.y });
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    setPan({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const onWheel = (e: React.WheelEvent) => {
    setZoom(z => Math.max(0.3, Math.min(5, z - e.deltaY * 0.002)));
  };

  const reset = () => {
    const img = imgRef.current;
    const scale = Math.max((CROP_R * 2) / img.naturalWidth, (CROP_R * 2) / img.naturalHeight);
    setZoom(scale);
    setPan({ x: 0, y: 0 });
  };

  const getCroppedBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const out = document.createElement('canvas');
      out.width = CROP_R * 2;
      out.height = CROP_R * 2;
      const ctx = out.getContext('2d');
      if (!ctx) return reject();
      const img = imgRef.current;

      ctx.beginPath();
      ctx.arc(CROP_R, CROP_R, CROP_R, 0, Math.PI * 2);
      ctx.clip();

      const scaledW = img.naturalWidth * zoom;
      const scaledH = img.naturalHeight * zoom;
      const x = SIZE / 2 - scaledW / 2 + pan.x - (SIZE / 2 - CROP_R);
      const y = SIZE / 2 - scaledH / 2 + pan.y - (SIZE / 2 - CROP_R);
      ctx.drawImage(img, x, y, scaledW, scaledH);

      out.toBlob((b) => {
        if (b) resolve(b);
        else reject();
      }, 'image/jpeg', 0.92);
    });

  const handleConfirm = async () => {
    setUploading(true);
    try {
      const blob = await getCroppedBlob();
      await onConfirm(blob);
    } catch {
      alert("Failed to crop image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Crop Profile Photo</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 p-5">
          <p className="text-xs text-gray-400 text-center">Drag to reposition · Scroll or pinch to zoom</p>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="rounded-xl cursor-grab active:cursor-grabbing touch-none border border-gray-100 dark:border-gray-800"
            style={{ width: SIZE, height: SIZE }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
            onWheel={onWheel}
          />

          <div className="flex items-center gap-3 w-full">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
              <ZoomOut size={18} />
            </button>
            <input
              type="range" min={0.3} max={5} step={0.05} value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#1C3EB9]"
            />
            <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
              <ZoomIn size={18} />
            </button>
            <button onClick={reset} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400" title="Reset">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={uploading}
            className="flex-1 py-2.5 bg-[#1C3EB9] text-white rounded-xl font-bold text-sm hover:bg-[#00b4a0] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <Loader size={16} className="text-white animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {uploading ? 'Uploading...' : 'Save Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropModal;
