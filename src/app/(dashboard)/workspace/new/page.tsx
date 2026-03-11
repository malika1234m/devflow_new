import { createWorkspace } from "@/lib/actions/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NewWorkspacePage() {
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create a workspace</h1>
          <p className="mt-1 text-gray-500">
            A workspace is a shared space for your team — like a company or project group.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form action={createWorkspace} className="space-y-6">
            <Input
              label="Workspace name"
              name="name"
              placeholder="Acme Corp, My Startup, Side Project..."
              hint="This will also be used to generate a URL slug."
              required
              autoFocus
            />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Create workspace
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-lg bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">What happens next?</p>
          <ul className="mt-2 space-y-1 text-sm text-indigo-700">
            <li>✓ You become the Owner of this workspace</li>
            <li>✓ You can invite team members</li>
            <li>✓ Create unlimited projects (Free plan: up to 3)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
