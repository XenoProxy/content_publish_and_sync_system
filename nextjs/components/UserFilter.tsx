"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UserFilterProps {
  users: number[];
}

export default function UserFilter({ users }: UserFilterProps) {
    
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentUser = searchParams.get("user_id");

    function handleChange(userId: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (userId) {
        params.set("user_id", userId);
    } else {
        params.delete("user_id");
    }

    params.set("page", "1");

    startTransition(() => {router.push(`/posts?${params.toString()}`)});
  }

  return (
    <select
      value={currentUser || ""}
      onChange={(e) => handleChange(e.target.value)}
      style={{ padding: 8, marginBottom: 20 }}
    >
      <option value="">All Authors</option>

      {users.map((id) => (
        <option key={id} value={id}>
          Author {id}
        </option>
      ))}
    </select>
  );
}
