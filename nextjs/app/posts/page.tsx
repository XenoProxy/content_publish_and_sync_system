import Link from "next/link";
import Pagination from "@/components/Pagination";
import { Post, PostsResponse } from "@/types/post";

interface PostsPageProps {
    searchParams: Promise<{
        page?: string;
        user_id?: string;
        search?: string;
    }>;
}

async function getPosts(searchParams: PostsPageProps["searchParams"]): Promise<PostsResponse> {
    const page = (await searchParams).page;
    const userId = (await searchParams).user_id;
    const search = (await searchParams).search;

    const query = new URLSearchParams({
        status: "published",
        per_page: "10",
    });

    if (userId) query.append("user_id", userId);
    if (search) query.append("search", search);
    if (page) query.append("page", page);

    const res = await fetch(
        `http://nginx/wp-json/content-sync/v1/posts?${query.toString()}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch posts");
    }

    return res.json();
}

export default async function PostsPage({searchParams}: PostsPageProps) {
    const params = await searchParams;
    const data = await getPosts(searchParams);

    const posts = data.data;
    const totalPages = data.meta.total_pages;
    const currentPage = Number(params?.page || 1);

    return (
        <div style={{ padding: 40 }}>
            <h1>All Posts</h1>

            {posts.length === 0 && <p>No posts</p>}

            {posts.map((post: Post) => (
            <div key={post.id} style={{ marginBottom: 20 }}>
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
            ))}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
