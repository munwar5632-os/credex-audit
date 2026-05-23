import { SpendForm } from "@/components/SpendForm";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-4">
        Find hidden savings in your AI subscriptions
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Audit your Cursor, ChatGPT, Claude and other AI tools – see where you're
        overspending.
      </p>
      <SpendForm />
    </main>
  );
}
