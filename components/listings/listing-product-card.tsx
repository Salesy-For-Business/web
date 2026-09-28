import Link from "next/link";
import { ProductImage } from "@/components/storefront/product-grid";
import { formatMoney, productHref } from "@/lib/storefront";
import type { ListingProduct } from "@/lib/listings";

export function ListingProductCard({ product }: { product: ListingProduct }) {
  return (
    <Link
      href={productHref(product.storeHandle, product.slug)}
      className="group block"
    >
      <ProductImage product={product} />
      <div className="mt-3 space-y-1">
        <p className="truncate text-[12px] font-medium uppercase tracking-[0.12em] text-muted">
          from {product.businessName}
        </p>
        <h2 className="text-[16px] leading-6 text-heading group-hover:text-link">
          {product.name}
        </h2>
        <p className="flex flex-wrap items-baseline gap-2 text-[15px]">
          <span className="font-medium text-heading">
            {formatMoney(product.price, product.currency)}
          </span>
          {product.compareAt ? (
            <span className="text-[13px] text-muted line-through">
              {formatMoney(product.compareAt, product.currency)}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}

export function ListingProductGrid({ products }: { products: ListingProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ListingProductCard
          key={`${product.storeHandle}-${product.id}`}
          product={product}
        />
      ))}
    </div>
  );
}
