"use client";

import { usePathname } from "next/navigation";
import { JSX, useEffect, useRef, useState } from "react";

export default function TopLoadingBar(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.target === "_blank") return;
      if (href.startsWith("#")) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
      } catch (err) {
        console.error(err);

        // ignore URL parse errors and proceed
      }

      setLoading(true);
      setProgress(10);

      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setProgress((p) => Math.min(90, p + Math.random() * 8));
      }, 350) as unknown as number;
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    // route changed — finish the bar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(100);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const t = window.setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 260);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        className="bg-secondary"
        style={{
          height: "100%",
          transform: `scaleX(${progress / 100})`,
          transformOrigin: "left",
          transition: loading
            ? "transform 0.18s linear"
            : "transform 0.3s ease-out, opacity 0.25s ease-out",
          opacity: loading ? 1 : 0,
        }}
      />
    </div>
  );
}
