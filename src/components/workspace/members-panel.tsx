"use client";

import { useState, useTransition } from "react";
import { inviteMember, updateMemberRole, removeMember } from "@/lib/actions/workspace";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface Member {
  id: string;
  role: Role;
  joinedAt: Date | string;
  userId: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface MembersPanelProps {
  workspaceId: string;
  initialMembers: Member[];
  currentUserId: string;
  currentUserRole: Role;
}

const ROLE_STYLES: Record<Role, string> = {
  OWNER: "bg-indigo-100 text-indigo-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MEMBER: "bg-gray-100 text-gray-600",
};

export function MembersPanel({
  workspaceId,
  initialMembers,
  currentUserId,
  currentUserRole,
}: MembersPanelProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  function canChangeRole(target: Member): boolean {
    if (target.role === "OWNER") return false;
    if (target.userId === currentUserId) return false;
    if (currentUserRole === "ADMIN" && target.role === "ADMIN") return false;
    return canManage;
  }

  function canRemove(target: Member): boolean {
    if (target.role === "OWNER") return false;
    if (target.userId === currentUserId) return false;
    if (currentUserRole === "ADMIN" && target.role === "ADMIN") return false;
    return canManage;
  }

  function availableRoles(target: Member): Role[] {
    if (currentUserRole === "OWNER") return ["ADMIN", "MEMBER"];
    return target.role === "ADMIN" ? ["MEMBER"] : ["MEMBER", "ADMIN"];
  }

  function handleInvite() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setInviteError("");
    setInviteSuccess("");

    startTransition(async () => {
      const result = await inviteMember(workspaceId, trimmed);
      if (result.error) {
        setInviteError(result.error);
      } else {
        setInviteSuccess(`${trimmed} has been added to the workspace.`);
        setEmail("");
      }
    });
  }

  function handleRoleChange(memberId: string, newRole: "ADMIN" | "MEMBER") {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    startTransition(async () => {
      const result = await updateMemberRole(memberId, newRole, workspaceId);
      if (result.error) {
        setMembers(initialMembers); // revert
      }
    });
  }

  function handleRemove(memberId: string) {
    setRemovingId(memberId);
    startTransition(async () => {
      const result = await removeMember(memberId, workspaceId);
      setRemovingId(null);
      if (!result.error) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Invite section */}
      {canManage && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Invite a member</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add someone by their DevFlow account email. They&apos;ll join as a Member.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setInviteError(""); setInviteSuccess(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
              placeholder="colleague@example.com"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleInvite}
              disabled={!email.trim() || isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Inviting…" : "Invite"}
            </button>
          </div>
          {inviteError && (
            <p className="mt-2 text-sm text-red-600">{inviteError}</p>
          )}
          {inviteSuccess && (
            <p className="mt-2 text-sm text-green-600">{inviteSuccess}</p>
          )}
        </div>
      )}

      {/* Members table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Members <span className="ml-1 text-sm font-normal text-gray-400">({members.length})</span>
          </h2>
        </div>

        <ul className="divide-y divide-gray-100">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-4 px-6 py-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {member.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.user.image}
                    alt={member.user.name ?? ""}
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {member.user.name?.slice(0, 2).toUpperCase() ?? "?"}
                  </div>
                )}
              </div>

              {/* Name + email */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">{member.user.name}</p>
                  {member.userId === currentUserId && (
                    <span className="text-xs text-gray-400">(you)</span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-500">{member.user.email}</p>
              </div>

              {/* Joined date */}
              <p className="hidden text-xs text-gray-400 sm:block">
                Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>

              {/* Role */}
              <div className="flex-shrink-0">
                {canChangeRole(member) ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as "ADMIN" | "MEMBER")}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {availableRoles(member).map((r) => (
                      <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_STYLES[member.role]}`}>
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                )}
              </div>

              {/* Remove */}
              <div className="flex-shrink-0 w-8">
                {canRemove(member) && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
                    title="Remove member"
                  >
                    {removingId === member.id ? <SpinnerIcon /> : <TrashIcon />}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
