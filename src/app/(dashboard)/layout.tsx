import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspaces = await db.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    select: { id: true, name: true, plan: true },
    orderBy: { createdAt: "asc" },
    take: 8,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
            DevFlow
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main nav */}
          <nav className="space-y-1 p-3">
            <NavLink href="/dashboard">
              <HomeIcon /> Dashboard
            </NavLink>
          </nav>

          {/* Workspaces */}
          <div className="px-3 pb-3">
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Workspaces
              </span>
              <Link
                href="/workspace/new"
                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="New workspace"
              >
                <PlusIcon />
              </Link>
            </div>

            {workspaces.length === 0 ? (
              <Link
                href="/workspace/new"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <PlusIcon /> Create workspace
              </Link>
            ) : (
              <div className="space-y-0.5">
                {workspaces.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/workspace/${ws.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-indigo-100 text-xs font-bold text-indigo-700">
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate">{ws.name}</span>
                    {ws.plan === "PRO" && (
                      <span className="ml-auto text-xs font-medium text-indigo-500">Pro</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <nav className="space-y-1 border-t border-gray-100 p-3">
            <NavLink href="/settings">
              <SettingsIcon /> Settings
            </NavLink>
          </nav>
        </div>

        {/* User */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {getInitials(session.user.name ?? "U")}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="truncate text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
    >
      {children}
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
