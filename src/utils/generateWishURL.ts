import {WishData } from "@/types";

export function generateWishURL(origin: string, data: WishData): string {
  const params = new URLSearchParams();
  const music = (data as WishData & { music?: string }).music?.trim();

  params.set("name", data.name.trim() || "Friend");
  params.set("age", String(clampAge(data.age)));
  if (data.message.trim()) params.set("msg", data.message.trim());
  if (music) params.set("music", music);
  if (data.senderName?.trim()) params.set("sender", data.senderName.trim());
  return `${origin}/?${params.toString()}`;
}

export function clampAge(age: number): number {
  if (!Number.isFinite(age)) return 25;
  return Math.min(100, Math.max(1, Math.round(age)));
}