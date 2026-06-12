import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/services/authClient";
import { Login } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data) throw redirect({ to: "/accounts" });
  },
  component: Login,
});
