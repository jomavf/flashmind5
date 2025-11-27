import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Edit, Trash2, Clock } from 'lucide-react';

import { useApp } from "../context/AppContext";
import { getDeckStats } from "../lib/deckUtils";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const Dashboard: React.FC = () => {
  const { data, deleteDeck } = useApp();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mis Mazos</h1>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Nuevo Mazo
        </Link>
      </div>

      {data.decks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No tienes mazos aún
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primer mazo para empezar a estudiar.
          </p>
          <Link
            to="/create"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Crear ahora &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.decks.map((deck) => {
            const stats = getDeckStats(deck);
            const isReady = stats.ready > 0;
            const isEmpty = stats.total === 0;

            return (
              <div
                key={deck.id}
                className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-64"
              >
                {/* Color Bar */}
                <div
                  className={cn(
                    "h-3 w-full",
                    deck.color ||
                      "bg-linear-to-r from-indigo-500 to-purple-500"
                  )}
                />

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                      {deck.title}
                    </h3>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm("¿Eliminar mazo?")) deleteDeck(deck.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {deck.description || "Sin descripción"}
                  </p>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-3 mb-4">
                    {isEmpty ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        Vacío
                      </span>
                    ) : isReady ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {stats.ready} para repasar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        {stats.nextReviewTime
                          ? formatDistanceToNow(stats.nextReviewTime, {
                              locale: es,
                              addSuffix: true,
                            })
                          : "Completado"}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Link
                      to={`/study/${deck.id}`}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all",
                        isReady
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                          : isEmpty
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      )}
                      onClick={(e) => isEmpty && e.preventDefault()}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {isReady ? "Estudiar" : isEmpty ? "Vacío" : "Repasar"}
                    </Link>
                    <Link
                      to={`/edit/${deck.id}`}
                      className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Hover Stats Expansion */}
                <div className="absolute inset-x-0 bottom-0 bg-gray-50/90 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-gray-100">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {stats.total}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Total
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-indigo-600">
                        {stats.learning}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Nuevas
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {stats.review}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Repaso
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
