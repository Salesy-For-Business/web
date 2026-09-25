"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import { productSchema, type ProductValues } from "@/lib/product-schemas";
import {
  getApiError,
  uploadProductImage,
  useCreateProductMutation,
  useUpdateProductMutation,
  type PublicProduct,
} from "@/lib/products/queries";
import clsx from "clsx";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: PublicProduct;
};

type PendingImage = { id: string; file: File; previewUrl: string };

const MAX_IMAGES = 8;

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const create = useCreateProductMutation();
  const update = useUpdateProductMutation(product?.id ?? "");

  // Already-uploaded Cloudinary URLs (existing photos on an edit) vs. files
  // picked in this session that haven't been uploaded yet — selecting
  // photos should feel instant, so we only touch Cloudinary once, at
  // final submit, uploading everything in parallel.
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images ?? [],
  );
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const pendingImagesRef = useRef(pendingImages);
  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  // Revoke any local preview URLs left over if the form unmounts without
  // submitting (e.g. the user clicks Cancel).
  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      compareAt: product?.compareAt ?? undefined,
      category: product?.category ?? "General",
      inStock: product?.inStock ?? true,
      stockQty: product?.stockQty ?? undefined,
      images: product?.images ?? [],
      tags: product?.tags ?? [],
      accent: product?.accent ?? "#0F766E",
    },
  });

  const totalImageCount = existingImages.length + pendingImages.length;
  const loading = isSubmitting || create.isPending || update.isPending;

  function onSelectFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_IMAGES - totalImageCount;
    if (room <= 0) return;
    const next = Array.from(files)
      .slice(0, room)
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    setPendingImages((prev) => [...prev, ...next]);
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removePendingImage(id: string) {
    setPendingImages((prev) => {
      const match = prev.find((p) => p.id === id);
      if (match) URL.revokeObjectURL(match.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function onSubmit(values: ProductValues) {
    try {
      // The only slow step: upload every newly picked photo to Cloudinary
      // now, in parallel, right before saving — not as each one is picked.
      const uploaded = pendingImages.length
        ? await Promise.all(pendingImages.map((p) => uploadProductImage(p.file)))
        : [];
      const payload: ProductValues = {
        ...values,
        images: [...existingImages, ...uploaded.map((u) => u.url)],
      };

      if (mode === "create") {
        await create.mutateAsync(payload);
        toast.success("Product created");
      } else if (product) {
        await update.mutateAsync(payload);
        toast.success("Product updated");
      }
      pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      toast.error(getApiError(err, "Could not save product."));
    }
  }

  return (
    <form className="mx-auto max-w-2xl space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="name" className={fieldLabelClass}>
          Product name
        </label>
        <input id="name" className={inputClass} {...register("name")} />
        {errors.name ? (
          <p className={fieldErrorClass}>{errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={fieldLabelClass}>
            Price (₦)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            step={1}
            className={inputClass}
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price ? (
            <p className={fieldErrorClass}>{errors.price.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="compareAt" className={fieldLabelClass}>
            Compare-at price (optional)
          </label>
          <input
            id="compareAt"
            type="number"
            min={0}
            step={1}
            className={inputClass}
            {...register("compareAt", {
              setValueAs: (v) =>
                v === "" || v == null || Number.isNaN(Number(v))
                  ? undefined
                  : Number(v),
            })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className={fieldLabelClass}>
          Category
        </label>
        <input id="category" className={inputClass} {...register("category")} />
        {errors.category ? (
          <p className={fieldErrorClass}>{errors.category.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="description" className={fieldLabelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          className={textareaClass}
          {...register("description")}
        />
        {errors.description ? (
          <p className={fieldErrorClass}>{errors.description.message}</p>
        ) : null}
      </div>

      <div>
        <p className={fieldLabelClass}>Photos</p>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((url) => (
            <div
              key={url}
              className="relative size-24 overflow-hidden rounded-lg border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                onClick={() => removeExistingImage(url)}
                aria-label="Remove image"
                disabled={loading}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {pendingImages.map((p) => (
            <div
              key={p.id}
              className="relative size-24 overflow-hidden rounded-lg border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.previewUrl} alt="" className="size-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                New
              </span>
              <button
                type="button"
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                onClick={() => removePendingImage(p.id)}
                aria-label="Remove image"
                disabled={loading}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {totalImageCount < MAX_IMAGES ? (
            <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface text-muted hover:border-primary hover:text-link">
              <ImagePlus className="size-5" />
              <span className="text-[11px]">Add photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={loading}
                onChange={(e) => {
                  onSelectFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          ) : null}
        </div>
        <p className={fieldHintClass}>
          Photos upload when you save the product, not right away — pick as
          many as you like first.
        </p>
        {errors.images ? (
          <p className={fieldErrorClass}>{errors.images.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="inStock"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-[14px]">
              <input
                type="checkbox"
                className="size-4 rounded border-border text-primary"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              In stock
            </label>
          )}
        />
        <div>
          <label htmlFor="stockQty" className={fieldLabelClass}>
            Stock quantity (optional)
          </label>
          <input
            id="stockQty"
            type="number"
            min={0}
            step={1}
            className={inputClass}
            {...register("stockQty", {
              setValueAs: (v) =>
                v === "" || v == null || Number.isNaN(Number(v))
                  ? undefined
                  : Number(v),
            })}
          />
        </div>
      </div>

      {loading && pendingImages.length > 0 ? (
        <p className={fieldHintClass} aria-live="polite">
          Processing {pendingImages.length}{" "}
          {pendingImages.length === 1 ? "photo" : "photos"} — this can take up
          to 45 seconds. Please stay on this page.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={clsx(primaryButtonClass, "w-auto px-6")}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {mode === "create" ? "Add product" : "Save changes"}
        </button>
        <Link
          href="/dashboard/products"
          className={clsx(secondaryButtonClass, "w-auto px-6")}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
