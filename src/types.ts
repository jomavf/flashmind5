export interface SRSFields {
  box: number;
  nextReview: number; // timestamp
  interval: number; // in minutes for learning, days for review? Or just minutes/days unified? SM-2 usually uses days. User mentioned minutes for early stages. Let's store interval in minutes for consistency or handle logic.
  easeFactor: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: number;
  srs: SRSFields;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  color: string; // Tailwind gradient class
  cards: Flashcard[];
}

export interface AppSettings {
  againMinutes: number;
  hardMinutes: number;
  goodMinutes: number;
  easyDays: number;
}

export interface AppData {
  decks: Deck[];
  settings: AppSettings;
}

export type SRSGrade = "again" | "hard" | "good" | "easy";
