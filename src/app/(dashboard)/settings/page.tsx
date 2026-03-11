import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-gray-500">Manage your account preferences.</p>

      <div className="mt-8 max-w-lg rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>
        <div className="flex items-center gap-4">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="h-16 w-16 rounded-full" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
              {session.user.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{session.user.name}</p>
            <p className="text-sm text-gray-500">{session.user.email}</p>
            <p className="mt-1 text-xs text-gray-400">Signed in via OAuth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
