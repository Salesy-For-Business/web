"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  fieldErrorClass,
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

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const create = useCreateProductMutation();
  const update = useUpdateProductMutation(product?.id ?? "");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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

  const images = watch("images") ?? [];
  const loading = isSubmitting || create.isPending || update.isPending;

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const next = [...images];
      for (const file of Array.from(files).slice(0, 8 - next.length)) {
        const uploaded = await uploadProductImage(file);
        next.push(uploaded.url);
      }
      setValue("images", next, { shouldValidate: true });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(getApiError(err, "Could not upload image."));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProductValues) {
    try {
      if (mode === "create") {
        await create.mutateAsync(values);
        toast.success("Product created");
      } else if (product) {
        await update.mutateAsync(values);
        toast.success("Product updated");
      }
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
          {images.map((url) => (
            <div
              key={url}
              className="relative size-24 overflow-hidden rounded-lg border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                onClick={() =>
                  setValue(
                    "images",
                    images.filter((u) => u !== url),
                    { shouldValidate: true },
                  )
                }
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {images.length < 8 ? (
            <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface text-muted hover:border-primary hover:text-link">
              {uploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" />
              )}
              <span className="text-[11px]">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => void onUpload(e.target.files)}
              />
            </label>
          ) : null}
        </div>
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

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploading}
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
