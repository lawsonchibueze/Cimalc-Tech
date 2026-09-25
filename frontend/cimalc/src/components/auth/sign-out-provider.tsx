"use client";

import { useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SignOutContext, useSignOutMutation } from "@/lib/auth/use-session";

/** One confirmation dialog shared by every sign-out button on the site. */
export function SignOutProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const signOut = useSignOutMutation();
  const value = useMemo(
    () => ({ mutate: () => setOpen(true), isPending: signOut.isPending }),
    [signOut.isPending],
  );

  return (
    <SignOutContext.Provider value={value}>
      {children}
      <Dialog isOpen={open} onClose={() => setOpen(false)} title="Sign out?">
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted">
            You will need to sign in again to see your quotes and account.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Stay signed in
            </Button>
            <Button
              variant="destructive"
              isLoading={signOut.isPending}
              onClick={() =>
                signOut.mutate(undefined, { onSettled: () => setOpen(false) })
              }
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </Dialog>
    </SignOutContext.Provider>
  );
}
