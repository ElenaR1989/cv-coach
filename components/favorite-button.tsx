"use client";

import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

type FavoriteButtonProps = {
  jobId: string;
  isFavorite: boolean;
};

export default function FavoriteButton({
  jobId,
  isFavorite,
}: FavoriteButtonProps) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const toggleFavorite = () => {
    startTransition(async () => {
      await supabase
        .from("job_applications")
        .update({ is_favorite: !isFavorite })
        .eq("id", jobId);

      window.location.reload();
    });
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isPending}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        isFavorite
          ? "border-yellow-400/40 bg-yellow-500/20 text-yellow-300"
          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
      }`}
    >
      {isPending ? "..." : isFavorite ? "★ Favorite" : "☆ Favorite"}
    </button>
  );
}