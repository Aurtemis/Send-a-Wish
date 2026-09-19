"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { hasWishParams, parseWishFromParams } from "@/utils/parseURL";
import Homepage from "./Homepage";
import RecipientExperience from "./RecipientExperience";

export default function AppRoot() {
  const searchParams = useSearchParams();
  const isRecipient = hasWishParams(searchParams);
  const wish = useMemo(() => parseWishFromParams(searchParams), [searchParams]);

  if (isRecipient) return <RecipientExperience wish={wish} />;
  return <Homepage />;
}
