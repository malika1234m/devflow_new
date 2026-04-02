export default function DashboardLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-56 rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-100" />
      </div>

      {/* Workspaces section */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-28 rounded bg-gray-200" />
          <div className="h-8 w-32 rounded-lg bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-100" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-20 rounded bg-gray-100" />
                <div className="h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks section */}
      <div>
        <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="space-y-1.5">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-100" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-16 rounded-full bg-gray-100" />
                <div className="h-4 w-12 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
