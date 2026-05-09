import { ShieldCheck, UserX, ServerOff, Github } from "lucide-react";

// Trust bar — 4 EEAT signals rendered immediately below the hero on
// pages where users land cold (homepage + tool pages). Each badge maps
// to a concrete, falsifiable claim made elsewhere on the site, which is
// what differentiates a trust bar from generic feel-good copy:
//   • Secure HTTPS  -> backed by Render's TLS termination
//   • No signup     -> there is no auth code in the repo at all
//   • No file storage -> downloads stream source -> client (see /api/download/start)
//   • Powered by yt-dlp -> dependency declared in package.json
//
// The component is server-renderable (no hooks/state) so it ships zero
// JS and contributes to LCP rather than blocking it.
export default function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "100% Secure HTTPS", colorClass: "text-emerald-500" },
    { icon: UserX, label: "No Signup Required", colorClass: "text-blue-500" },
    { icon: ServerOff, label: "Files Not Stored on Servers", colorClass: "text-purple-500" },
    { icon: Github, label: "Powered by yt-dlp Open Source", colorClass: "text-orange-500" },
  ];

  return (
    <ul
      role="list"
      aria-label="Trust and security badges"
      className="max-w-5xl mx-auto px-4 mt-4 mb-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground"
    >
      {items.map(({ icon: Icon, label, colorClass }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />
          <span className="font-medium">{label}</span>
        </li>
      ))}
    </ul>
  );
}
