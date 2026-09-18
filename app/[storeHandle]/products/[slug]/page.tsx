import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/product-detail";
import { getProduct } from "@/lib/storefront";
import { resolveStorefront } from "@/lib/storefront-db";

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ storeHandle: string; slug: string }>;
}) {
  const { storeHandle, slug } = await params;
  const store = await resolveStorefront(storeHandle);
  // Store missing is handled by the parent layout UI.
  if (!store) notFound();
  const product = getProduct(store, slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
