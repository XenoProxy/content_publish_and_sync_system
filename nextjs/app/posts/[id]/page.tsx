import { notFound } from "next/navigation";

export const revalidate = 3600;

interface Post {
  id: number;
  title: string;
  body: string;
  author_name: string;
  published_at: string;
}

async function getPost(id: string): Promise<Post | null> {
  const res = await fetch(
    `http://nginx/wp-json/content-sync/v1/posts?status=published&id=${id}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.data?.[0] || null;
}

export default async function PostPage(
  { params }: { params: { id: string } }
) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    author: {
      "@type": "Person",
      name: post.author_name,
    },
    datePublished: post.published_at,
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>{post.title}</h1>

      <p>
        By {post.author_name} |{" "}
        {new Date(post.published_at).toLocaleDateString()}
      </p>

      <article>{post.body}</article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </div>
  );
}
