// app/messages/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation"; // if you want to send unauth users to /login

export default async function MessagesPage() {
  const supabase = await getSupabaseServer();   // ✅ await and correct name

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // either redirect or render a message
    redirect("/login"); // or: return <p>Please sign in</p>;
  }

  const { data: threads, error } = await supabase
    .from("threads")
    .select("id, last_message, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    // handle error state in your UI as you prefer
    return <p className="p-6 text-red-600">Failed to load messages.</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Messages</h1>
      <ul className="space-y-3">
        {threads?.map((t) => (
          <li key={t.id} className="p-3 rounded border">
            <div className="text-sm text-gray-500">{new Date(t.updated_at).toLocaleString()}</div>
            <div className="font-medium">{t.last_message}</div>
          </li>
        )) ?? null}
      </ul>
    </main>
  );
}
