import { useState } from "react";

interface AssetImageProps {
  src: string;
  alt: string;
  caption?: string;
  placeholder: string;
  variant?: "scene" | "portrait";
}

export function AssetImage({ src, alt, caption, placeholder, variant = "scene" }: AssetImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`asset-empty ${variant}`} aria-hidden="true">
        <span>{placeholder}</span>
      </div>
    );
  }

  return (
    <div className={`asset-image ${variant}`}>
      <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      {caption ? <span className="asset-caption">{caption}</span> : null}
    </div>
  );
}
