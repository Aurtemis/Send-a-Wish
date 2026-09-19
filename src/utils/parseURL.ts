import { WishData } from "@/types";

const DEFAULTS: WishData = {
  name: "Friend",
  age: 25,
  message: "Happy Birthday!",
  senderName: null,
};

export function parseWishFromParams(params: URLSearchParams): WishData {
  const name = params.get("name")?.trim() || DEFAULTS.name;

  const rawAge = params.get("age");
  const parsedAge = rawAge ? parseInt(rawAge, 10) : NaN;
  const age =
    Number.isFinite(parsedAge) && parsedAge >= 1 && parsedAge <= 100
      ? parsedAge
      : DEFAULTS.age;

  const message = params.get("msg")?.trim() || DEFAULTS.message;
  const senderName = params.get("sender")?.trim() || null;

  return { name, age, message, senderName};
}

export function hasWishParams(params: URLSearchParams): boolean {
  return (
    params.has("name") ||
    params.has("age") ||
    params.has("msg") ||
    params.has("sender")
  );
}