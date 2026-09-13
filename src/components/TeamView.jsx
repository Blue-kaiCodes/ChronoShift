import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  QrCode,
  Link,
  Copy,
  Clock,
  Briefcase,
  Sliders,
  Check
} from "lucide-react";
import toast from "react-hot-toast";

export default function TeamView({
  currentUser,
  currentWorkspace,
  workspaceUsers,
  onInvite,
  onRemoveMember,
  onUpdateRole
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Contributor");
  const [inviteTitle, setInviteTitle] = useState("");
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState("Contributor");
  const [editTitle, setEditTitle] = useState("");

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    onInvite(inviteEmail, inviteRole, inviteTitle || "Teammate");
    setInviteEmail("");
    setInviteTitle("");
  };

  const handleCopyLink = () => {
    const inviteLink = `https://chronoshift.co/join/${currentWorkspace?.id || "default"}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Teammate invite link copied to clipboard!");
  };

  const handleSaveEdit = (userId) => {
    onUpdateRole(userId, editRole, editTitle);
    setEditingUserId(null);
  };

  const startEditing = (member) => {
    setEditingUserId(member.id);
    setEditRole(member.workspaceRole || "Contributor");
    setEditTitle(member.workspaceTitle || "");
  };

  // Determine current user's role in this workspace to enforce security restrictions
  const currentUserRole = currentWorkspace?.members?.find(m => m.userId === currentUser?.id)?.role || "Contributor";
  const isPrivileged = currentUserRole === "Owner" || currentUserRole === "Admin";

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900/60 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Team
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage roles, workspace permissions, and send invitations
          </p>
        </div>
        <div className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg text-zinc-500 border border-zinc-200/40 dark:border-zinc-800 font-bold">
          YOUR ROLE: {currentUserRole.toUpperCase()}
        </div>
      </div>

      {/* DUAL WORKSPACE: LEFT INVITATION ENGINE, RIGHT ACTIVE ROSTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: DISPATCH INVITATIONS */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-zinc-400" />
              <span>Invite members</span>
            </h3>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Workspace Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option>Contributor</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Position Title
                  </label>
                  <input
                    type="text"
                    placeholder="Lead Designer"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isPrivileged}
                className="w-full py-2.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Send invitation</span>
              </button>
            </form>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100 dark:border-zinc-900/60" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#0F0F11] text-[10px] text-zinc-400 font-medium">
                or share link
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Copy Share Link</span>
              </button>
            </div>
          </div>

          {/* QR CODE ENGINE */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl text-center">
            <h3 className="text-xs font-medium text-zinc-500 mb-3 flex items-center justify-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              <span>Workspace QR code</span>
            </h3>
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl inline-block border border-zinc-100 dark:border-zinc-900">
              {/* Sleek SVG Minimalist QR design */}
              <svg className="w-24 h-24 mx-auto text-zinc-900 dark:text-zinc-100" viewBox="0 0 100 100" fill="currentColor">
                <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z" />
                <path d="M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z" />
                <path d="M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" />
                <path d="M45,15 h5 v10 h-5 z M55,5 h5 v15 h-5 z M45,45 h15 v5 h-15 z M15,45 h15 v5 h-15 z" />
                <path d="M75,45 h20 v5 h-20 z M65,55 h10 v15 h-10 z M45,65 h10 v30 h-10 z M55,75 h20 v5 h-20 z" />
                <path d="M85,75 h10 v10 h-10 z M75,85 h20 v10 h-20 z" />
              </svg>
            </div>
            <span className="text-[10px] text-zinc-400 block mt-2">Scan to join workspace</span>
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE ROSTER & ROLES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Workspace members</span>
            </h3>

            <div className="space-y-4">
              {workspaceUsers.map((member) => {
                const isMe = member.id === currentUser?.id;
                const isEditing = editingUserId === member.id;

                return (
                  <div
                    key={member.id}
                    className="p-4 bg-zinc-50/30 dark:bg-[#121214]/30 border border-zinc-100 dark:border-zinc-900/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-200 dark:hover:border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                        style={{ backgroundColor: member.avatarColor || "#71717a" }}
                      >
                        {(member.displayName || member.fullName || member.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {member.displayName || member.fullName || member.email || "Anonymous"}
                          </span>
                          {isMe && (
                            <span className="text-[9px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                          @{member.username} • {member.city}, {member.country}
                        </span>
                        <span className="text-[10px] text-indigo-500 font-medium block mt-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          <span>{member.workspaceTitle || "Team Member"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                          >
                            <option>Contributor</option>
                            <option>Admin</option>
                            <option>Owner</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-24 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(member.id)}
                            className="p-1 bg-emerald-500 text-white rounded hover:opacity-95"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 px-2.5 py-1 rounded-md text-zinc-500 font-bold">
                            {member.workspaceRole?.toUpperCase() || "CONTRIBUTOR"}
                          </span>
                        </div>
                      )}

                      {/* ACTIONS */}
                      {isPrivileged && !isMe && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEditing(member)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            title="Edit Permissions"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveMember(member.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PENDING INVITATIONS */}
          {currentWorkspace?.invitations && currentWorkspace.invitations.length > 0 && (
            <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 mb-4">
                Pending Invitations ({currentWorkspace.invitations.filter(i => i.status === "Pending").length})
              </h3>
              <div className="space-y-3">
                {currentWorkspace.invitations.map((inv) => (
                  <div key={inv.id} className="p-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{inv.email}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Role: {inv.role} • Position: {inv.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
