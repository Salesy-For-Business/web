"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import clsx from "clsx";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import { Select } from "@/components/ui/select";
import { blogPostSchema, type BlogPostValues } from "@/lib/blog-schemas";
import {
  getApiError,
  uploadBlogImage,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  type AdminBlogPostDetail,
} from "@/lib/admin/blog-queries";

// CodeMirror (which the editor is built on) touches the DOM at import time,
// so it can only ever render on the client.
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export function BlogPostForm({ post }: { post?: AdminBlogPostDetail }) {
  const router = useRouter();
  const create = useCreateBlogPostMutation();
  const update = useUpdateBlogPostMutation(post?.id ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostValues>({
    resolver: zodResolver(blogPostSchema) as never,
    defaultValues: {
      title: post?.title ?? "",
      excerpt: post?.excerpt ?? "",
      contentMarkdown: post?.contentMarkdown ?? "",
      coverImage: post?.coverImage ?? "",
      status: post?.status ?? "draft",
      tags: post?.tags ?? [],
    },
  });

  const loading = isSubmitting || create.isPending || update.isPending;

  async function onCoverSelected(file: File | null) {
    if (!file) return;
    setUploadingCover(true);
    try {
      const uploaded = await uploadBlogImage(file);
      setCoverImage(uploaded.url);
      setValue("coverImage", uploaded.url);
    } catch (err) {
      toast.error(getApiError(err, "Could not upload cover image."));
    } finally {
      setUploadingCover(false);
    }
  }

  async function onInsertInlineImage(file: File | null) {
    if (!file) return;
    setUploadingInline(true);
    try {
      const uploaded = await uploadBlogImage(file);
      const current = getValues("contentMarkdown");
      setValue(
        "contentMarkdown",
        `${current}${current.endsWith("\n") ? "" : "\n\n"}![](${uploaded.url})\n`,
      );
      toast.success("Image inserted at the end of the post.");
    } catch (err) {
      toast.error(getApiError(err, "Could not upload image."));
    } finally {
      setUploadingInline(false);
    }
  }

  async function onSubmit(values: BlogPostValues) {
    try {
      if (post) {
        await update.mutateAsync(values);
        toast.success("Post updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Post created");
      }
      router.push("/admin/blog");
    } catch (err) {
      toast.error(getApiError(err, "Could not save post."));
    }
  }

  return (
    <form className="max-w-3xl space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="title" className={fieldLabelClass}>
          Title
        </label>
        <input id="title" className={inputClass} {...register("title")} />
        {errors.title ? <p className={fieldErrorClass}>{errors.title.message}</p> : null}
      </div>

      <div>
        <label htmlFor="excerpt" className={fieldLabelClass}>
          Excerpt
        </label>
        <textarea
          id="excerpt"
          rows={2}
          className={textareaClass}
          placeholder="A short summary shown on the blog listing"
          {...register("excerpt")}
        />
        {errors.excerpt ? <p className={fieldErrorClass}>{errors.excerpt.message}</p> : null}
      </div>

      <div>
        <p className={fieldLabelClass}>Cover image</p>
        {coverImage ? (
          <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="" className="aspect-video w-full object-cover" />
            <button
              type="button"
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white"
              onClick={() => {
                setCoverImage("");
                setValue("coverImage", "");
              }}
              aria-label="Remove cover image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex aspect-video w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface text-muted hover:border-primary hover:text-link">
            {uploadingCover ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="size-5" />
                <span className="text-[12px]">Upload cover image</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingCover}
              onChange={(e) => void onCoverSelected(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={fieldLabelClass}>Content</label>
          <label className="cursor-pointer text-[13px] font-medium text-link hover:underline">
            {uploadingInline ? "Uploading…" : "Insert image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingInline}
              onChange={(e) => {
                void onInsertInlineImage(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <Controller
          name="contentMarkdown"
          control={control}
          render={({ field }) => (
            <div data-color-mode="light">
              <MDEditor
                value={field.value}
                onChange={(v) => field.onChange(v ?? "")}
                height={420}
                preview="live"
              />
            </div>
          )}
        />
        <p className={fieldHintClass}>
          Written in Markdown — use the toolbar for formatting, or write it directly.
        </p>
        {errors.contentMarkdown ? (
          <p className={fieldErrorClass}>{errors.contentMarkdown.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status"
              ariaLabel="Status"
              options={STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <div>
              <label htmlFor="tags" className={fieldLabelClass}>
                Tags (comma separated)
              </label>
              <input
                id="tags"
                className={inputClass}
                defaultValue={field.value.join(", ")}
                onBlur={(e) =>
                  field.onChange(
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .slice(0, 6),
                  )
                }
                placeholder="e.g. selling tips, payments"
              />
            </div>
          )}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className={clsx(primaryButtonClass, "w-auto px-6")}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {post ? "Save changes" : "Create post"}
        </button>
        <button
          type="button"
          className={clsx(secondaryButtonClass, "w-auto px-6")}
          onClick={() => router.push("/admin/blog")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
