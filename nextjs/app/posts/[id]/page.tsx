import type { Metadata } from "next";
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


export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        return {};
    }

    const description = post.body.substring(0, 150);

    return {
        title: post.title,
        description,

        openGraph: {
            title: post.title,
            description,
            type: "article"
        },

        twitter: {
            card: "summary_large_image",
            title: post.title,
            description
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
  <div style={{ padding: 40 }}>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        author: {
            "@type": "Person",
            name: post.author_name,
        },
        datePublished: post.published_at,
        dateModified: post.published_at,
        description: post.body.substring(0, 150)
        }),
      }}
    />

    <PostDetail post={post} />
  </div>
  );
}
