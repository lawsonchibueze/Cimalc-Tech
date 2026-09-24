"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { useSession } from "@/lib/auth/use-session";
import { updateMyProfile } from "@/lib/api/users";
import { errorMessage } from "@/lib/api/client";
import { sessionKeys } from "@/lib/queries/account";
import { changePasswordSchema, profileSchema, type ChangePasswordInput, type ProfileInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function ProfileForm() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const values = useMemo<ProfileInput>(() => ({ name: user?.name ?? "" }), [user?.name]);
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), values });

  const save = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(sessionKeys.current, (current: typeof user) => (current ? { ...current, name: updated.name } : current));
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <form onSubmit={handleSubmit((data) => save.mutate(data))} noValidate>
      <Card>
        <CardContent className="space-y-5 p-5 md:p-6">
          <div>
            <h2 className="text-lg font-semibold">Your details</h2>
            <p className="mt-1 text-sm text-muted">This name appears on quote requests you send while signed in.</p>
          </div>
          <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" value={user?.email ?? ""} readOnly disabled hint="Your email is used to sign in and cannot be changed here." />
          <div className="flex justify-end"><Button type="submit" isLoading={save.isPending} disabled={!isDirty}>Save changes</Button></div>
        </CardContent>
      </Card>
    </form>
  );
}

function PasswordForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });
  const change = useMutation({
    mutationFn: (data: ChangePasswordInput) => authClient.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => { toast.success("Password changed. Other devices were signed out."); reset(); },
    onError: (error) => toast.error(errorMessage(error, "We could not change your password.")),
  });

  return (
    <form onSubmit={handleSubmit((data) => change.mutate(data))} noValidate>
      <Card>
        <CardContent className="space-y-5 p-5 md:p-6">
          <div>
            <h2 className="text-lg font-semibold">Change password</h2>
            <p className="mt-1 text-sm text-muted">Accounts that only use Google sign-in do not have a password to change.</p>
          </div>
          <Input label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword")} />
          <Input label="New password" type="password" autoComplete="new-password" hint="Use at least 8 characters." error={errors.newPassword?.message} {...register("newPassword")} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <div className="flex justify-end"><Button type="submit" isLoading={change.isPending}>Change password</Button></div>
        </CardContent>
      </Card>
    </form>
  );
}

export default function AccountProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">Account settings</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Profile</h1>
      </div>
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}
