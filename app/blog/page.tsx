import type { Metadata } from "next";
import { Header, Footer } from "@/components/landing";
import { BlogList } from "@/components/blog/blog-list";
import { getPublishedPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Salesy",
  description: "Guides, product updates, and stories for entrepreneurs selling on Salesy.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const { posts, hasMore } = await getPublishedPosts(1);

  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">
            Blog
          </p>
          <h1 className="mt-3 font-display text-[36px] leading-11 tracking-tight text-heading sm:text-[44px]">
            Ideas, guides, and updates
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
            For entrepreneurs building and growing their store on Salesy.
          </p>

          <div className="mt-12">
            <BlogList initialPosts={posts} initialHasMore={hasMore} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
