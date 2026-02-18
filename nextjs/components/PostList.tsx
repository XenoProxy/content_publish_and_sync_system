import { Post } from "@/types/post";
import PostCard from "./PostCard";

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (!posts.length) {
    return <p>No posts</p>;
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
