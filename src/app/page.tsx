import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">DevFlow</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          AI-powered project management
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Ship faster with
          <span className="text-indigo-600"> AI-powered</span>
          <br />
          team management
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
          DevFlow combines task management with Claude AI to auto-summarize tasks,
          generate project reports, and keep your team aligned — all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Start for free
          </Link>
          <a
            href="https://github.com"
            className="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Everything your team needs
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">Simple pricing</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-8 text-left">
              <h3 className="text-lg font-semibold">Free</h3>
              <div className="my-4 text-4xl font-bold">$0<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 3 projects</li>
                <li>✓ 5 team members</li>
                <li>✓ Basic AI summaries</li>
              </ul>
              <Link href="/login" className="mt-6 block rounded-lg border border-indigo-600 px-4 py-2 text-center text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                Get started
              </Link>
            </div>
            <div className="rounded-xl border-2 border-indigo-600 p-8 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">Popular</div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="my-4 text-4xl font-bold">$12<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Unlimited projects</li>
                <li>✓ Unlimited members</li>
                <li>✓ Advanced AI reports</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href="/login" className="mt-6 block rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "🤖",
    title: "AI Task Summaries",
    description: "Claude AI reads your task comments and generates instant status summaries — no manual updates needed.",
  },
  {
    icon: "📊",
    title: "Project Reports",
    description: "Get a full AI-generated project health report with blockers, progress, and next steps in one click.",
  },
  {
    icon: "👥",
    title: "Team Workspaces",
    description: "Multi-tenant workspaces with roles (Owner, Admin, Member), task assignment, and activity feeds.",
  },
];
