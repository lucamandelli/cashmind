import { authClient } from "@/services/authClient";

export function useAuth() {
  return {
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    useSession: authClient.useSession,
    getSession: authClient.getSession,
  };
}
