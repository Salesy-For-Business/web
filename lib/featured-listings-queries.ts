"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { FeatureProductValues } from "@/lib/featured-listing-schemas";

export type FeaturableProduct = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  featuredUntil: string | null;
};

export type FeaturedListingDashboardData = {
  currency: string;
  weeklyPriceMinorUnits: number | null;
  products: FeaturableProduct[];
  currentlyFeatured: { productId: string; featuredUntil: string } | null;
};

export const featuredListingKeys = {
  dashboard: ["featured-listings", "dashboard"] as const,
};

export function useFeaturedListingDashboardQuery() {
  return useQuery({
    queryKey: featuredListingKeys.dashboard,
    queryFn: async () => {
      const { data } = await api.get<ApiOk<FeaturedListingDashboardData>>(
        "/dashboard/featured-listings",
      );
      return data;
    },
  });
}

export function useFeatureProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: FeatureProductValues) => {
      const { data } = await api.post<ApiOk<{ authorizationUrl: string }>>(
        "/dashboard/featured-listings",
        values,
      );
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: featuredListingKeys.dashboard });
    },
  });
}

export { getApiError };
