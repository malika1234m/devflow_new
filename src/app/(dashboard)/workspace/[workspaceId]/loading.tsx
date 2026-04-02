export default function WorkspaceLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-200" />
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-lg bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-9 w-32 rounded-lg bg-gray-100" />
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="mt-2 h-8 w-12 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-10">
        <div className="mb-4 h-5 w-20 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-5 w-16 rounded-full bg-gray-100" />
              </div>
              <div className="mb-3 h-1.5 w-full rounded-full bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="mb-4 h-5 w-28 rounded bg-gray-200" />
        <div className="flex flex-wrap gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <div className="h-7 w-7 rounded-full bg-gray-200" />
              <div className="space-y-1">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-2.5 w-12 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
