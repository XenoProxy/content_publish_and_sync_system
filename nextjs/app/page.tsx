import type { Metadata } from "next";

import PostList from "@/components/PostList";
import { Post } from "@/types/post";
import { PostsResponse } from "@/types/post";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Last 10 published posts"
};

async function getLatestPosts(): Promise<Post[]> {
  const res = await fetch(
    "http://nginx/wp-json/content-sync/v1/posts?status=published&per_page=10&orderby=published_at&order=desc"
  );

  if (!res.ok) {
    throw new Error("Failed to fetch latest posts");
  }

  const data: PostsResponse = await res.json();
  return data.data ?? [];
}

export default async function HomePage() {
  const posts = await getLatestPosts();

  return (
    <div style={{ padding: 40 }}>
        <h1>Latest Articles</h1>

        {posts.length === 0 ? (
          <p>No posts</p>
          ) : (
          <PostList posts={posts} />
        )}
    </div>
  );
}
