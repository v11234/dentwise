"use client";

import { getAdminAnalytics } from "@/lib/actions/admin";
import { useQuery } from "@tanstack/react-query";

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["getAdminAnalytics"],
    queryFn: getAdminAnalytics,
  });
}
