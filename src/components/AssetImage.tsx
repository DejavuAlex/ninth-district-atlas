import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AssetImageProps {
  src: string;
  alt: string;
  caption?: string;
  placeholder: string;
  variant?: "scene" | "portrait";
  zoomable?: boolean;
  motionSrc?: string;
  motionFallbackSrc?: string;
}

const MAX_RETRIES = 2;

export function AssetImage({
  src,
  alt,
  caption,
  placeholder,
  variant = "scene",
  zoomable = false,
  motionSrc,
  motionFallbackSrc
}: AssetImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [motionPlaying, setMotionPlaying] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    setZoomed(false);
    setMotionPlaying(false);
  }, [src, motionSrc]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [zoomed]);

  const handleError = () => {
    if (attempt < MAX_RETRIES) {
      setAttempt(attempt + 1);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div className={`asset-empty ${variant}`} aria-hidden="true">
        <span>{placeholder}</span>
      </div>
    );
  }

  const retrySrc = attempt > 0 ? `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}` : src;
  const canZoom = zoomable && !failed;
  const canPlayMotion = variant === "portrait" && Boolean(motionSrc);

  const imageEl = (
    <img
      key={`${src}#${attempt}`}
      src={retrySrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
    />
  );

  return (
    <div className={`asset-image ${variant}`}>
      {canPlayMotion ? (
        <button
          type="button"
          className={`motion-portrait-toggle ${motionPlaying ? "is-playing" : ""}`}
          onClick={() => setMotionPlaying((value) => !value)}
        >
          {motionPlaying ? "显示静态立绘" : "播放动态立绘"}
        </button>
      ) : null}
      {canZoom ? (
        <button
          type="button"
          className="asset-zoom-trigger"
          onClick={() => setZoomed(true)}
          aria-label={`放大查看${alt}`}
        >
          {imageEl}
          <span className="asset-zoom-hint" aria-hidden="true">点击放大</span>
        </button>
      ) : (
        imageEl
      )}
      {canPlayMotion && motionPlaying ? (
        <video
          className="motion-portrait-video"
          autoPlay
          muted
          loop
          playsInline
          poster={retrySrc}
          aria-label={`${alt}动态立绘`}
        >
          <source src={motionSrc} type="video/webm" />
          {motionFallbackSrc ? <source src={motionFallbackSrc} type="video/mp4" /> : null}
        </video>
      ) : null}
      {caption ? <span className="asset-caption">{caption}</span> : null}
      {canZoom && zoomed
        ? createPortal(
            <div className="asset-lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setZoomed(false)}>
              <img src={retrySrc} alt={alt} onClick={(event) => event.stopPropagation()} />
              <button type="button" className="asset-lightbox-close" aria-label="关闭" onClick={() => setZoomed(false)}>
                ×
              </button>
              {caption ? <span className="asset-lightbox-caption">{caption}</span> : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
