"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SearchInput = ({
  placeholder = "Search...",
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const timeout = setTimeout(() => {
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <input
      type="text"
      name="query"
      id="query"
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className={
        className ??
        "border text-sm border-primary-lighter/50 px-4 sm:w-80 w-full py-1 rounded-full focus:border-primary-lighter transition-colors focus:outline-0"
      }
    />
  );
};

export default SearchInput;
