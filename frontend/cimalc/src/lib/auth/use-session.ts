"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "./auth-client";
import { sessionKeys } from "@/lib/queries/account";
import type { SessionUser } from "@/types/user";

/** The signed in user, shared by the header, account area and admin area. */
export function useSession() {
  const query = useQuery({
    queryKey: sessionKeys.current,
    queryFn: async (): Promise<SessionUser | null> => (await authClient.getSession())?.user ?? null,
    staleTime: 60_000,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isPending: query.isPending,
    isAdmin: query.data?.role === "ADMIN",
    refresh: () => query.refetch(),
  };
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authClient.signOut(),
    onSettled: () => {
      queryClient.setQueryData(sessionKeys.current, null);
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["admin"] });
      router.replace("/");
    },
  });
}
