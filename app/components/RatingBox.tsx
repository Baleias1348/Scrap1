"use client";
import React, { useState } from "react";

interface RatingBoxProps {
  messageIdx: number;
  onRated: (rating: number) => void;
}

export default function RatingBox({ messageIdx, onRated }: RatingBoxProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleClick = (rating: number) => {
    setSelected(rating);
    setSubmitted(true);
    onRated(rating);
  };

  return (
    <div className="flex flex-col items-center mt-2">
      <span className="text-xs text-gray-500 mb-1">Ayúdanos a entrenar a nuestro agente, califica la respuesta.</span>
      <div className="flex space-x-1">
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            className={`w-5 h-5 p-0 border-none bg-transparent focus:outline-none ${selected && star <= selected ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => handleClick(star)}
            disabled={submitted}
            aria-label={`Calificar ${star} estrella${star > 1 ? 's' : ''}`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.538 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.783.57-1.838-.197-1.538-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.393c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.966z" />
            </svg>
          </button>
        ))}
      </div>
      {submitted && <span className="text-xs text-green-600 mt-1">¡Gracias por tu evaluación!</span>}
    </div>
  );
}
