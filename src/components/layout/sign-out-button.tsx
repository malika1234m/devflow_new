"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      Sign out
    </button>
  );
}
