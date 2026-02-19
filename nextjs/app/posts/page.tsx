import type { Metadata } from "next";

import Pagination from "@/components/Pagination";
import PostList from "@/components/PostList";
import SearchBar from "@/components/SearchBar"
import UserFilter from "@/components/UserFilter";
import { PostsResponse } from "@/types/post";

interface SearchParams {
    page?: string;
    user_id?: string;
    search?: string;
}

interface PostsPageProps {
    searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
    title: "All published posts"
};

export const revalidate = 60;

async function getPosts(params:SearchParams): Promise<PostsResponse> {
    const { page, user_id, search } = params;

    const query = new URLSearchParams({
        status: "published",
        per_page: "10",
    });

    if (page) query.append("page", page);
    if (user_id) query.append("user_id", user_id);
    if (search) query.append("search", search);

    const res = await fetch(
        `http://nginx/wp-json/content-sync/v1/posts?${query.toString()}`,
        { next: { revalidate: 60 } }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch posts");
    }

    return res.json();
}

export default async function PostsPage({searchParams}: PostsPageProps) {
    const params = await searchParams;
    const data = await getPosts(params);
    const currentPage = Number(params?.page || 1);

    return (
        <div style={{ padding: 40 }}>
            <h1>All Posts</h1>

            <SearchBar />
            
            <UserFilter users={[1,2,3,4,5,6,7,8,9,10]} />

            <PostList posts={data.data} />

            <Pagination
                currentPage={currentPage}
                totalPages={data.meta.total_pages}
            />
        </div>
    );
}
