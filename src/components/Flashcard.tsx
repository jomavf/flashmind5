import React from "react";
import { cn } from "../lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashcardComponent: React.FC<FlashcardProps> = ({
  front,
  back,
  isFlipped,
  onFlip,
}) => {
  return (
    <div
      className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div
        className={cn(
          "w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-3xl",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-3xl backface-hidden flex items-center justify-center p-8 border border-gray-100">
          <div className="text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">
              Pregunta
            </span>
            <p className="text-2xl md:text-4xl font-medium text-gray-900">
              {front}
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full bg-indigo-50 rounded-3xl backface-hidden rotate-y-180 flex items-center justify-center p-8 border border-indigo-100">
          <div className="text-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 block">
              Respuesta
            </span>
            <p className="text-2xl md:text-4xl font-medium text-indigo-900">
              {back}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
