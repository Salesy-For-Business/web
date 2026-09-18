"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";

export type PublicReview = {
  id: string;
  name: string;
  rating: number;
  body: string;
  product: string;
  productId: string | null;
  orderReference: string;
  createdAt: string;
};

export const reviewKeys = {
  all: ["reviews"] as const,
};

export function useReviewsQuery() {
  return useQuery({
    queryKey: reviewKeys.all,
    queryFn: async () => {
      const { data } = await api.get<
        ApiOk<{
          reviews: PublicReview[];
          count: number;
          averageRating: number;
        }>
      >("/reviews");
      return data;
    },
    staleTime: 30_000,
  });
}
