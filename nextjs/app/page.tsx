import Link from "next/link";
import { Post } from "@/types/post";

async function getPosts(): Promise<Post[]> {
    const res = await fetch(
        "http://nginx/wp-json/content-sync/v1/posts?status=published&per_page=10",
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch posts");
    }

    const data = await res.json();
    return data.data || [];
}
  
export default async function HomePage() {
    const posts = await getPosts();

    return (
        <div style={{ padding: 40 }}>
        <h1>Published Articles</h1>

        {posts.length === 0 && <p>No posts</p>}

        {posts.map((post: Post) => (
            <div key={post.id} style={{ marginBottom: 30 }}>
            <h2>
                <Link href={`/posts/${post.id}`}>
                {post.title}
                </Link>
            </h2>

            <p>
                By {post.author_name} |{" "}
                {new Date(post.published_at).toLocaleDateString()}
            </p>

            <p>{post.body.substring(0, 120)}...</p>
            </div>
        ))}
        </div>
    );
}
  