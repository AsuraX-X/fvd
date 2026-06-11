"use client";
import { useDarkMode } from "@/hooks/useColorScheme";
import Image from "next/image";

const Logo = () => {
  const isDark = useDarkMode();

  return (
    <div className="relative flex w-32 aspect-9/4 shrink-0">
      <Image
        src={isDark ? "/logo/FVD-LGOa-inverted.png" : "/logo/FVD-LGOa.png"}
        alt="logo"
        fill
        objectFit="cover"
      />
    </div>
  );
};

export default Logo;
