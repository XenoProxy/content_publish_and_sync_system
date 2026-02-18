import Link from "next/link";

interface Post {
  id: number;
  title: string;
  body: string;
  author_name: string;
  published_at: string;
}

interface Props {
  searchParams: {
    page?: string;
    user_id?: string;
    search?: string;
  };
}

async function getPosts(params: Props["searchParams"]): Promise<any> {
    const page = params.page || "1";
    const userId = params.user_id || "";
    const search = params.search || "";

    const query = new URLSearchParams({
    status: "published",
    page,
    per_page: "10",
    });

    if (userId) query.append("user_id", userId);
    if (search) query.append("search", search);

    const res = await fetch(
    `http://nginx/wp-json/content-sync/v1/posts?${query.toString()}`,
    { cache: "no-store" }
    );

    if (!res.ok) {
    throw new Error("Failed to fetch posts");
    }

    return res.json();
}

export default async function PostsPage({ searchParams }: Props) {
    const data = await getPosts(searchParams);

    const posts = data.data ?? [];
    const totalPages = data.meta.total_pages ?? 1;
    const currentPage = Number(searchParams.page || 1);

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
                {post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : ""}
                </p>
            </div>
            ))}

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
        </div>
      );
}
