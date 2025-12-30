"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";

interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src?: string | string[] | null;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/images/image.png",
  className,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  
  // Handle if src is an array or string
  let imageSrc: string = fallbackSrc;
  
  if (src) {
    if (Array.isArray(src)) {
      imageSrc = src[0] || fallbackSrc;
    } else {
      imageSrc = src;
    }
  }

  // Check for placeholder strings
  const isPlaceholder = (url: string) => {
    if (!url) return true;
    const placeholderPatterns = [
      "placehold.co",
      "placeholder",
      "via.placeholder",
      "dummyimage.com",
      "loremflickr.com",
      "picsum.photos",
      "unsplash.com/photo-1517694712202-14dd9538aa97", // Specific common placeholder
    ];
    return placeholderPatterns.some(pattern => url.includes(pattern));
  };

  const [currentSrc, setCurrentSrc] = useState(isPlaceholder(imageSrc) ? fallbackSrc : imageSrc);

  useEffect(() => {
    if (src) {
      const newSrc = Array.isArray(src) ? src[0] : src;
      if (newSrc && !isPlaceholder(newSrc)) {
        setCurrentSrc(newSrc);
      } else {
        setCurrentSrc(fallbackSrc);
      }
      setError(false);
    } else {
      setCurrentSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  if (error || !currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <ImageIcon className="h-1/3 w-1/3 text-muted-foreground opacity-20" />
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt || "Image"}
      className={className}
      onError={() => {
        setError(true);
      }}
      {...props}
    />
  );
}
