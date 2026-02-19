import { Post } from "@/types/post";

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({ post }: PostDetailProps) {
  return (
    <div>
      <h1>{post.title}</h1>

      <p>
        By {post.author_name} |{" "}
        {new Date(post.published_at).toLocaleDateString()}
      </p>

      <div style={{ marginTop: 20 }}>
        {post.body}
      </div>
    </div>
  );
}
