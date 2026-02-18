import React from "react";
import Link from "next/link";
import { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2>
        <Link href={`/posts/${post.id}`}>
          {post.title}
        </Link>
      </h2>

      <p>
        By {post.author_name} |{" "}
        {new Date(post.published_at).toLocaleDateString()}
      </p>
    </div>
  );
}

export default React.memo(PostCard);
