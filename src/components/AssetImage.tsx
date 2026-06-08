import { useEffect, useState } from "react";

interface AssetImageProps {
  src: string;
  alt: string;
  caption?: string;
  placeholder: string;
  variant?: "scene" | "portrait";
}

const MAX_RETRIES = 2;

export function AssetImage({ src, alt, caption, placeholder, variant = "scene" }: AssetImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

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

  return (
    <div className={`asset-image ${variant}`}>
      <img
        key={`${src}#${attempt}`}
        src={retrySrc}
        alt={alt}
        loading="lazy"
        onError={handleError}
      />
      {caption ? <span className="asset-caption">{caption}</span> : null}
    </div>
  );
}
