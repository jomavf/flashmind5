import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save, Upload, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Deck, Flashcard } from "../types";
import { cn } from "../lib/utils";

export const CreateDeck: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, addDeck, updateDeck } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<Partial<Flashcard>[]>([]);
  const [activeTab, setActiveTab] = useState<"manual" | "import">("manual");

  useEffect(() => {
    if (id) {
      const deck = data.decks.find((d) => d.id === id);
      if (deck) {
        setTitle(deck.title);
        setDescription(deck.description);
        setCards(deck.cards);
      }
    }
  }, [id, data.decks]);

  const handleAddCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const handleCardChange = (
    index: number,
    field: "front" | "back",
    value: string
  ) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const newCards = json.map((item: any) => ({
            front: item.front || item.question || "",
            back: item.back || item.answer || "",
          }));
          setCards([...cards, ...newCards]);
          setActiveTab("manual");
        } else {
          alert("Formato JSON inválido. Debe ser un array de objetos.");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("El título es obligatorio");
      return;
    }

    const validCards = cards.filter((c) => c.front && c.back);

    const newDeck: Deck = {
      id: id || crypto.randomUUID(),
      title,
      description,
      color: "bg-linear-to-r from-blue-500 to-cyan-500", // Randomize later
      cards: validCards.map((c) => ({
        id: c.id || crypto.randomUUID(),
        front: c.front!,
        back: c.back!,
        createdAt: c.createdAt || Date.now(),
        srs: c.srs || {
          box: 0,
          nextReview: 0,
          interval: 0,
          easeFactor: 2.5,
        },
      })) as Flashcard[],
    };

    if (id) {
      updateDeck(newDeck);
    } else {
      addDeck(newDeck);
    }
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? "Editar Mazo" : "Crear Nuevo Mazo"}
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Mazo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Ej. Inglés Básico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Breve descripción del contenido..."
              rows={3}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("manual")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "manual"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                Manual
              </button>
              <button
                onClick={() => setActiveTab("import")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "import"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                Importar JSON
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {cards.length} tarjetas
            </span>
          </div>

          {activeTab === "manual" ? (
            <div className="space-y-4">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start animate-fade-in"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={card.front}
                      onChange={(e) =>
                        handleCardChange(index, "front", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Pregunta (Frente)"
                    />
                    <input
                      type="text"
                      value={card.back}
                      onChange={(e) =>
                        handleCardChange(index, "back", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Respuesta (Reverso)"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveCard(index)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <button
                onClick={handleAddCard}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Agregar Tarjeta
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sube tu archivo JSON
              </h3>
              <p className="text-gray-500 mb-6 text-sm">
                El archivo debe contener un array de objetos con propiedades
                "front" y "back".
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                "
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar Mazo
          </button>
        </div>
      </div>
    </div>
  );
};
