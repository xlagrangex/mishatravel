import { getBlogPosts } from "@/lib/supabase/queries/blog";
import BlogTable from "./BlogTable";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogTable posts={posts} />;
}
