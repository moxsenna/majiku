"use client";

import { useQuery } from "@tanstack/react-query";
import { getTenantProfile } from "@/server/actions/adminDashboard";
import { istilahLembaga, type JenisLembaga } from "@/lib/istilah";

/** Istilah per lembaga untuk portal admin & guru (membaca jenis lembaga dari profil tenant). */
export function useIstilah() {
  const { data } = useQuery({
    queryKey: ["tenant-profile"],
    queryFn: getTenantProfile,
    staleTime: 5 * 60_000,
  });
  return istilahLembaga((data?.type as JenisLembaga | undefined) ?? null);
}
