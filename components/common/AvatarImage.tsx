"use client";

import { ReactNode, useState } from "react";

type AvatarImageProps = {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
};

const AvatarImage = ({ src, alt, fallback, className }: AvatarImageProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export default AvatarImage;
