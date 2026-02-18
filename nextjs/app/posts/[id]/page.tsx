import { notFound } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import { Post } from "@/types/post";

interface PostPageProps {
    params: Promise<{
      id: string;
    }>;
  }

export const revalidate = 3600;

async function getPost(id: string): Promise<Post | null> {
    const res = await fetch(
        `http://nginx/wp-json/content-sync/v1/posts/${id}`,
        { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
        return null;
    }

    const data = await res.json();
    return data.data ?? null;
}

export default async function PostPage({params}: PostPageProps) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div style={{ padding: 40 }}>
            <PostDetail post={post} />
        </div>
    );
}
