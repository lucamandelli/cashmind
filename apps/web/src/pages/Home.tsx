import { useQuery } from "@tanstack/react-query";
import type { HealthResponse } from "@cashmind/shared";

export function Home() {
  const { data, isLoading, error } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/api/health", { credentials: "include" });
      if (!res.ok) throw new Error("Health check failed");
      return res.json() as Promise<HealthResponse>;
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">CashMind</h1>
      <div className="rounded border p-4 bg-gray-50">
        <p className="text-sm text-gray-500 mb-2">API Health</p>
        <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </main>
  );
}
