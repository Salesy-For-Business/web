import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(150),
  excerpt: z.string().trim().min(10, "Add a short excerpt (at least 10 characters)").max(300),
  contentMarkdown: z.string().trim().min(20, "Write a bit more content"),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string().trim().min(1).max(30)).max(6),
});

export type BlogPostValues = z.infer<typeof blogPostSchema>;

export function slugifyTitle(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "post";
}
