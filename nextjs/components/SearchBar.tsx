"use client";
import React, { memo } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialSearch = searchParams.get("search") || "";
    const [value, setValue] = useState(initialSearch);
    const [isPending, startTransition] = useTransition();

useEffect(() => {
const handler = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
    params.set("search", value);
    } else {
    params.delete("search");
    }

    params.set("page", "1");

    startTransition(() => {
    router.push(`/posts?${params.toString()}`);
    });
}, 300);

    return () => clearTimeout(handler);
  }, [value]);

  return (
    <>
      <input
        type="text"
        placeholder="Search by title..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ padding: 8, marginBottom: 20, width: 300 }}
      />
      {isPending && <p>Updating...</p>}
    </>
  );
}

export default memo(SearchBar);
