import { Suspense } from "react";
import { site } from "@/lib/site";
import LoginForm from "./LoginForm";

export const metadata = { title: `Admin login — ${site.name}`, robots: { index: false } };

async function Form({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <LoginForm linkError={error === "link"} />;
}

export default function AdminLogin({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{"// admin"}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{site.name} admin</h1>
        <div className="mt-8">
          <Suspense>
            <Form searchParams={searchParams as Promise<{ error?: string }>} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
