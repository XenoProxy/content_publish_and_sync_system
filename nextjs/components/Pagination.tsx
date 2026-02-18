"use client";

import React from "react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function Pagination({currentPage, totalPages}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ marginTop: 40 }}>
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;

        return (
          <Link
            key={page}
            href={`/posts?page=${page}`}
            style={{
              marginRight: 10,
              fontWeight: page === currentPage ? "bold" : "normal",
            }}
          >
            {page}
          </Link>
        );
      })}
    </div>
  );
}

export default React.memo(Pagination);
