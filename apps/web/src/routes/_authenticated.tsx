import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/services/authClient";
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: "/login" });
  },
  component: AuthenticatedLayout,
});
