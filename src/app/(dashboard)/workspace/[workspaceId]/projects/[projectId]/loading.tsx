export default function ProjectLoading() {
  return (
    <div className="flex h-full flex-col animate-pulse">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3.5 w-20 rounded bg-gray-100" />
          <div className="h-3.5 w-3.5 rounded bg-gray-100" />
          <div className="h-3.5 w-28 rounded bg-gray-100" />
          <div className="h-3.5 w-3.5 rounded bg-gray-100" />
          <div className="h-3.5 w-24 rounded bg-gray-200" />
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-7 w-52 rounded-lg bg-gray-200" />
              <div className="h-5 w-16 rounded-full bg-gray-100" />
            </div>
            <div className="h-4 w-72 rounded bg-gray-100" />
          </div>
          <div className="h-8 w-36 rounded-lg bg-gray-100" />
        </div>

        {/* Stats bar */}
        <div className="mt-4 flex items-center gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-baseline gap-1.5">
              <div className="h-6 w-6 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-100" />
            </div>
          ))}
          <div className="flex flex-1 items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-gray-100" />
            <div className="h-3 w-8 rounded bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Kanban skeleton */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, col) => (
            <div key={col} className="flex w-72 flex-shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-5 w-6 rounded-full bg-white" />
              </div>
              <div className="flex flex-col gap-2">
                {[...Array(col === 0 ? 3 : col === 1 ? 2 : 1)].map((_, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-2 h-4 rounded bg-gray-200" style={{ width: `${60 + (i * 15) % 30}%` }} />
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-14 rounded-full bg-gray-100" />
                      <div className="h-5 w-5 rounded-full bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
