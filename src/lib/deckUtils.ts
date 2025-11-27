import type { Deck, Flashcard } from "../types";

export interface DeckStats {
  total: number;
  ready: number;
  learning: number; // box 0
  review: number; // box > 0
  nextReviewTime: number | null; // Earliest next review time for waiting cards
}

export function getDeckStats(deck: Deck): DeckStats {
  const now = Date.now();
  let ready = 0;
  let learning = 0;
  let review = 0;
  let nextReviewTime: number | null = null;

  deck.cards.forEach((card) => {
    if (card.srs.nextReview <= now) {
      ready++;
    } else {
      if (nextReviewTime === null || card.srs.nextReview < nextReviewTime) {
        nextReviewTime = card.srs.nextReview;
      }
    }

    if (card.srs.box === 0) learning++;
    else review++;
  });

  return {
    total: deck.cards.length,
    ready,
    learning,
    review,
    nextReviewTime,
  };
}
