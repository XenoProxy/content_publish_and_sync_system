import React from "react";
import { Post } from "@/types/post";
import PostCard from "./PostCard";

interface PostListProps {
  posts: Post[];
}

function PostList({ posts }: PostListProps) {
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}

export default React.memo(PostList);
