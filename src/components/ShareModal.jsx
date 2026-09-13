import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, X, Share2, MessageSquare, Terminal, Table, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function ShareModal({
  isOpen,
  onClose,
  meetingTimeUTC,
  duration = 60,
  referenceTimezone = "UTC",
  localizedTimes = [],
  score = 100
}) {
  const [activeFormat, setActiveFormat] = useState("discord");
  const [copiedKey, setCopiedKey] = useState("");

  if (!isOpen || !meetingTimeUTC) return null;

  const unixTimestamp = Math.floor(meetingTimeUTC.getTime() / 1000);
  const endTimestamp = unixTimestamp + duration * 60;

  // 1. Discord Dynamic Timestamp format
  const discordFormat = `🗓️ **Team Sync (ChronoShift)**
⏰ <t:${unixTimestamp}:F> (<t:${unixTimestamp}:R>)
⏱️ Duration: ${duration} minutes
✨ Team Overlap: ${score.toFixed(0)}%
${localizedTimes.map(t => `• **${t.name}**: ${t.localTime} (${t.city || t.diffFromRefString})`).join("\n")}`;

  // 2. Slack Markdown format
  const slackFormat = `*🗓️ Team Sync Notification*
*Date & Time:* <!date^${unixTimestamp}^{date_long} at {time}|${meetingTimeUTC.toUTCString()}>
*Duration:* ${duration} mins | *Team Overlap:* ${score.toFixed(0)}%
*Localized Schedule:*
${localizedTimes.map(t => `• *${t.name}* (${t.city}): \`${t.localTime}\` _(${t.category})_`).join("\n")}`;

  // 3. GitHub / Notion Markdown Table
  const markdownTableFormat = `### 🗓️ Team Sync Schedule

- **Meeting Time:** ${meetingTimeUTC.toUTCString()}
- **Duration:** ${duration} minutes
- **Availability Match:** ${score.toFixed(0)}%

| Teammate | Location | Local Time | Status |
| :--- | :--- | :--- | :--- |
${localizedTimes.map(t => `| **${t.name}** | ${t.city || "-"} | \`${t.localTime}\` | ${t.category.toUpperCase()} |`).join("\n")}
`;

  // 4. Shareable URL Link
  const shareableUrl = `${window.location.origin}/#sync?date=${meetingTimeUTC.toISOString().split("T")[0]}&hour=${meetingTimeUTC.getUTCHours()}&duration=${duration}&tz=${encodeURIComponent(referenceTimezone)}`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const formats = [
    { id: "discord", label: "Discord", icon: MessageSquare, content: discordFormat, desc: "Auto-translates to each reader's local timezone in Discord chats" },
    { id: "slack", label: "Slack", icon: Terminal, content: slackFormat, desc: "Formatted with Slack mrkdwn and timestamp tokens" },
    { id: "markdown", label: "Markdown Table", icon: Table, content: markdownTableFormat, desc: "Ready to paste into GitHub Issues, PRs, or Notion documents" },
    { id: "link", label: "Direct URL", icon: LinkIcon, content: shareableUrl, desc: "Shareable link encoding the date, hour, and duration" }
  ];

  const currentContent = formats.find(f => f.id === activeFormat)?.content || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Developer Share Hub
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-900 px-6 gap-2 bg-zinc-50/50 dark:bg-zinc-950/30">
          {formats.map((f) => {
            const Icon = f.icon;
            const isActive = activeFormat === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFormat(f.id)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT PREVIEW */}
        <div className="p-6 flex flex-col gap-3">
          <p className="text-xs text-zinc-500">
            {formats.find(f => f.id === activeFormat)?.desc}
          </p>

          <div className="relative">
            <pre className="w-full p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-60 border border-zinc-800">
              {currentContent}
            </pre>

            <button
              onClick={() => copyToClipboard(currentContent, activeFormat)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === activeFormat ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/40 text-[11px] font-mono text-zinc-400">
          <span>Target: {meetingTimeUTC.toUTCString()}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
