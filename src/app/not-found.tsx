import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center">
      <div className="mb-4 text-7xl font-black text-gray-100">404</div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Page not found</h1>
      <p className="mb-8 text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
