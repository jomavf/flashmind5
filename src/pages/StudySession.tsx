import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { FlashcardComponent } from "../components/Flashcard";
import { calculateNextReview } from "../lib/srs";
import type { Flashcard, SRSGrade } from "../types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const StudySession: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, updateDeck } = useApp();

  const [deck, setDeck] = useState(data.decks.find((d) => d.id === id));
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [nextAvailableTime, setNextAvailableTime] = useState<number | null>(
    null
  );
  const [now, setNow] = useState(() => Date.now());
  const [newCardsCount, setNewCardsCount] = useState(0);

  // Update deck reference when data changes
  useEffect(() => {
    const d = data.decks.find((d) => d.id === id);
    if (d) setDeck(d);
  }, [data.decks, id]);

  // Poll for new ready cards
  useEffect(() => {
    if (!deck) return;
    const checkNewCards = () => {
      const currentIds = new Set(queue.map((q) => q.id));
      if (currentCard) currentIds.add(currentCard.id);

      const count = deck.cards.filter(
        (c) => c.srs.nextReview <= Date.now() && !currentIds.has(c.id)
      ).length;

      setNewCardsCount(count);
    };

    const interval = setInterval(checkNewCards, 5000);
    checkNewCards(); // Initial check
    return () => clearInterval(interval);
  }, [deck, queue, currentCard]);

  const handleRefreshQueue = () => {
    if (!deck) return;
    const readyCards = deck.cards.filter((c) => c.srs.nextReview <= Date.now());
    const shuffled = [...readyCards].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setNewCardsCount(0);
    if (!currentCard && shuffled.length > 0) {
      setCurrentCard(shuffled[0]);
      setIsFlipped(false);
    }
  };

  // Initialize Queue
  useEffect(() => {
    if (!deck) return;

    const readyCards = deck.cards.filter((c) => c.srs.nextReview <= now);
    // Sort by priority? For now, random or creation order.
    // Let's shuffle slightly to avoid same order always
    const shuffled = [...readyCards].sort(() => Math.random() - 0.5);

    setQueue(shuffled);

    // Find next available time if queue is empty
    if (shuffled.length === 0) {
      const futureCards = deck.cards.filter((c) => c.srs.nextReview > now);
      if (futureCards.length > 0) {
        const next = Math.min(...futureCards.map((c) => c.srs.nextReview));
        setNextAvailableTime(next);
      } else {
        setNextAvailableTime(null);
      }
    }
  }, [deck?.id]); // Only re-init on deck load, not every render.
  // Wait, if we update the deck, we don't want to reset the queue completely if we are in session.
  // But for simplicity, let's manage queue locally.

  // Timer for countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (queue.length > 0 && !currentCard) {
      setCurrentCard(queue[0]);
      setIsFlipped(false);
    } else if (queue.length === 0) {
      setCurrentCard(null);
      // Re-check next available time from the updated deck
      if (deck) {
        const futureCards = deck.cards.filter(
          (c) => c.srs.nextReview > Date.now()
        );
        if (futureCards.length > 0) {
          setNextAvailableTime(
            Math.min(...futureCards.map((c) => c.srs.nextReview))
          );
        } else {
          setNextAvailableTime(null);
        }
      }
    }
  }, [queue, deck, currentCard]);

  const handleRate = (grade: SRSGrade) => {
    if (!currentCard || !deck) return;

    const updatedCard = calculateNextReview(currentCard, grade, data.settings);

    // Update deck in global state
    const updatedDeck = {
      ...deck,
      cards: deck.cards.map((c) => (c.id === currentCard.id ? updatedCard : c)),
    };
    updateDeck(updatedDeck);

    // Update stats
    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      correct: grade !== "again" ? prev.correct + 1 : prev.correct,
    }));

    // Manage Queue
    if (grade === "again") {
      // Re-queue at the end
      setQueue((prev) => [...prev.slice(1), updatedCard]);
    } else {
      // Remove from queue
      setQueue((prev) => prev.slice(1));
    }

    setCurrentCard(null); // Will trigger effect to load next
  };

  if (!deck) return <div>Mazo no encontrado</div>;

  // Waiting Screen
  if (!currentCard && queue.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          {nextAvailableTime ? (
            <Clock className="w-12 h-12" />
          ) : (
            <CheckCircle className="w-12 h-12" />
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {nextAvailableTime ? "Sesión en Pausa" : "¡Mazo Completado!"}
          </h2>
          <p className="text-gray-500 text-lg">
            {nextAvailableTime
              ? "No hay tarjetas pendientes por ahora."
              : "Has repasado todas las tarjetas de este mazo."}
          </p>
        </div>

        {nextAvailableTime && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-sm mx-auto">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">
              Próximo repaso en
            </p>
            <div className="text-4xl font-mono font-bold text-indigo-600">
              {nextAvailableTime > now
                ? formatDistanceToNow(nextAvailableTime, { locale: es })
                : "¡Ahora!"}
            </div>
            {nextAvailableTime <= now && (
              <button
                onClick={() => window.location.reload()} // Simple reload to refresh queue or trigger re-fetch
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                Actualizar
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header / Progress */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1 mx-8">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{
                width: `${
                  (sessionStats.reviewed /
                    (sessionStats.reviewed + queue.length)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          {queue.length} restantes
        </div>
      </div>

      {/* Card Area */}
      <div className="flex justify-center py-8">
        {currentCard && (
          <FlashcardComponent
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 min-h-20">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all w-full max-w-xs"
          >
            Mostrar Respuesta
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-4 w-full max-w-2xl animate-fade-in">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleRate("again")}
                className="px-4 py-3 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-100"
              >
                Repetir
              </button>
              <span className="text-xs text-center text-gray-400">
                {data.settings.againMinutes}m
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleRate("hard")}
                className="px-4 py-3 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors border border-amber-100"
              >
                Difícil
              </button>
              <span className="text-xs text-center text-gray-400">
                {data.settings.hardMinutes}m
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleRate("good")}
                className="px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors border border-green-100"
              >
                Bien
              </button>
              <span className="text-xs text-center text-gray-400">
                {data.settings.goodMinutes}m
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleRate("easy")}
                className="px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors border border-blue-100"
              >
                Fácil
              </button>
              <span className="text-xs text-center text-gray-400">
                {data.settings.easyDays}d
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {newCardsCount > 0 && (
        <div className="fixed bottom-8 right-8 animate-fade-in z-50">
          <button
            onClick={handleRefreshQueue}
            className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 font-medium"
          >
            <Clock className="w-5 h-5" />
            {newCardsCount} tarjetas disponibles
          </button>
        </div>
      )}
    </div>
  );
};
