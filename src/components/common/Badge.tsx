import React from "react";
import { cn } from "@/lib/utils";
import { PartyStatus, PartyType } from "@/types/party";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "status" | "type" | "role" | "default";
  status?: PartyStatus;
  partyType?: PartyType;
  role?: string;
}

export function Badge({
  variant = "default",
  status,
  partyType,
  role,
  className,
  children,
  ...props
}: BadgeProps) {
  let style = "bg-slate-800 text-slate-300 border-slate-700";

  if (variant === "status" && status) {
    switch (status) {
      case "Upcoming":
        style = "bg-sky-500/15 text-sky-300 border-sky-500/30";
        break;
      case "Ongoing":
        style = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse";
        break;
      case "Completed":
        style = "bg-purple-500/15 text-purple-300 border-purple-500/30";
        break;
      case "Cancelled":
        style = "bg-rose-500/15 text-rose-300 border-rose-500/30";
        break;
    }
  } else if (variant === "type" && partyType) {
    switch (partyType) {
      case "Birthday":
        style = "bg-pink-500/15 text-pink-300 border-pink-500/30";
        break;
      case "House Party":
        style = "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30";
        break;
      case "Trip":
        style = "bg-amber-500/15 text-amber-300 border-amber-500/30";
        break;
      case "Dinner":
        style = "bg-teal-500/15 text-teal-300 border-teal-500/30";
        break;
      case "Festival":
        style = "bg-orange-500/15 text-orange-300 border-orange-500/30";
        break;
      default:
        style = "bg-violet-500/15 text-violet-300 border-violet-500/30";
        break;
    }
  } else if (variant === "role" && role) {
    if (role === "GLOBAL_ADMIN") {
      style = "bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 text-amber-300 border-amber-500/40 font-semibold";
    } else if (role === "HOST") {
      style = "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30";
    } else if (role === "CO_HOST") {
      style = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    } else {
      style = "bg-slate-800 text-slate-300 border-slate-700";
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        style,
        className
      )}
      {...props}
    >
      {children || status || partyType || role}
    </span>
  );
}

