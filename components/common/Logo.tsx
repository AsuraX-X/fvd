"use client";
import { useDarkMode } from "@/hooks/useColorScheme";
import Image from "next/image";

const Logo = () => {
  const isDark = useDarkMode();

  return (
    <div className="relative w-26 lg:w-32 aspect-185/101 shrink-0">
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
