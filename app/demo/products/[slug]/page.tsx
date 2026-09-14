import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/product-detail";
import { DEMO_STORE, getProduct } from "@/lib/storefront";

export default async function DemoProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(DEMO_STORE, slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
