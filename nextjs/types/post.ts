export interface Post {
    id: number;
    title: string;
    body: string;
    author_name: string;
    published_at: string;
}

export interface PostsMeta {
    total: number;
    total_pages: number;
    current_page: number;
    per_page: number;
}

export interface PostsResponse {
    success: boolean;
    data: Post[];
    meta: PostsMeta;
}
  