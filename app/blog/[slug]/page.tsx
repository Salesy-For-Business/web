import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { BlogContent } from "@/components/blog/blog-content";
import { BlogPostGrid } from "@/components/blog/blog-post-card";
import { getPublishedPostBySlug, getRelatedPosts } from "@/lib/blog";
import { appOrigin } from "@/lib/storefront";

type BlogPostParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<BlogPostParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { robots: { index: false, follow: false } };
  }

  const url = `${appOrigin()}/blog/${post.slug}`;

  return {
    title: `${post.title} — Salesy Blog`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "Salesy",
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<BlogPostParams>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, 3);
  const url = `${appOrigin()}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
    author: { "@type": "Person", name: post.authorName },
    datePublished: post.publishedAt,
    mainEntityOfPage: url,
  };

  return (
    <div className="flex flex-1 flex-col bg-background">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 px-6 py-16 sm:px-10 lg:px-16">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-[14px] font-medium text-link hover:text-link-hover"
          >
            <ChevronLeft className="size-4" /> All posts
          </Link>

          <p className="mt-6 text-[13px] font-medium uppercase tracking-[0.16em] text-muted">
            {post.tags[0] ?? "Salesy"}
          </p>
          <h1 className="mt-3 font-display text-[32px] leading-10 tracking-tight text-heading sm:text-[40px] sm:leading-[1.15]">
            {post.title}
          </h1>
          <p className="mt-4 text-[14px] text-muted">
            {post.authorName} ·{" "}
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {post.coverImage ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-10">
            <BlogContent markdown={post.contentMarkdown} />
          </div>

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-surface px-2.5 py-1 text-[12px] font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        {related.length > 0 ? (
          <div className="mx-auto mt-20 max-w-6xl border-t border-border pt-12">
            <h2 className="font-display text-[22px] tracking-tight text-heading">
              More from the blog
            </h2>
            <div className="mt-8">
              <BlogPostGrid posts={related} />
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
