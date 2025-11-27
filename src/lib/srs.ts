import type { Flashcard, AppSettings, SRSGrade } from "../types";

export function calculateNextReview(
  card: Flashcard,
  grade: SRSGrade,
  settings: AppSettings
): Flashcard {
  const now = Date.now();
  let { interval, easeFactor, box } = card.srs;

  // Default values if missing (migration/new cards)
  if (!easeFactor) easeFactor = 2.5;
  if (!interval) interval = 0;
  if (!box) box = 0;

  let nextInterval = 0; // in minutes
  let nextEaseFactor = easeFactor;
  let nextBox = box;

  switch (grade) {
    case "again":
      nextInterval = settings.againMinutes;
      nextEaseFactor = Math.max(1.3, easeFactor - 0.2);
      nextBox = 0;
      break;

    case "hard":
      nextInterval = interval === 0 ? settings.hardMinutes : interval * 1.2;
      nextEaseFactor = Math.max(1.3, easeFactor - 0.15);
      nextBox = Math.max(0, box - 1); // Maybe keep box or reduce?
      break;

    case "good":
      if (interval === 0) {
        nextInterval = settings.goodMinutes;
      } else {
        nextInterval = interval * easeFactor;
      }
      nextBox = box + 1;
      break;

    case "easy":
      nextInterval = settings.easyDays * 24 * 60; // Convert days to minutes
      nextEaseFactor = easeFactor + 0.15;
      nextBox = box + 2;
      break;
  }

  // Calculate next review timestamp
  // nextInterval is in minutes
  const nextReview = now + nextInterval * 60 * 1000;

  return {
    ...card,
    srs: {
      box: nextBox,
      nextReview,
      interval: nextInterval,
      easeFactor: nextEaseFactor,
    },
  };
}
