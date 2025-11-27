import React, { useState } from "react";
import { Save, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { AppSettings } from "../types";

export const Settings: React.FC = () => {
  const { data, updateSettings, setData } = useApp();
  const [settings, setSettings] = useState<AppSettings>(data.settings);

  const handleChange = (field: keyof AppSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleSave = () => {
    updateSettings(settings);
    alert("Configuración guardada");
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flashmind-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.decks && json.settings) {
          if (
            confirm("¿Estás seguro? Esto reemplazará todos tus datos actuales.")
          ) {
            setData(json);
            alert("Datos restaurados correctamente.");
          }
        } else {
          alert("Archivo de respaldo inválido.");
        }
      } catch (err) {
        alert("Error al leer el archivo.");
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    // Columns: Deck, Question, Answer, Next Review, Status
    const rows = [
      ["Mazo", "Pregunta", "Respuesta", "Próximo Repaso", "Estado"],
    ];

    data.decks.forEach((deck) => {
      deck.cards.forEach((card) => {
        const nextReview = new Date(card.srs.nextReview).toLocaleString();
        const status = card.srs.box === 0 ? "Aprendiendo" : "Repaso";
        rows.push([
          `"${deck.title}"`,
          `"${card.front.replace(/"/g, '""')}"`,
          `"${card.back.replace(/"/g, '""')}"`,
          `"${nextReview}"`,
          `"${status}"`,
        ]);
      });
    });

    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flashmind-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>

      {/* SRS Settings */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Save className="w-5 h-5 text-indigo-600" />
          Algoritmo SRS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repetir (minutos)
            </label>
            <input
              type="number"
              value={settings.againMinutes}
              onChange={(e) => handleChange("againMinutes", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difícil (minutos)
            </label>
            <input
              type="number"
              value={settings.hardMinutes}
              onChange={(e) => handleChange("hardMinutes", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bien (minutos)
            </label>
            <input
              type="number"
              value={settings.goodMinutes}
              onChange={(e) => handleChange("goodMinutes", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fácil (días)
            </label>
            <input
              type="number"
              value={settings.easyDays}
              onChange={(e) => handleChange("easyDays", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          Gestión de Datos
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-900">Copia de Seguridad</h3>
              <p className="text-sm text-gray-500">
                Descarga todos tus datos en formato JSON
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Descargar Backup"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-900">Restaurar Datos</h3>
              <p className="text-sm text-gray-500">
                Reemplaza todo con un archivo de respaldo
              </p>
            </div>
            <label className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-6 h-6" />
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-900">
                Exportar a Excel/CSV
              </h3>
              <p className="text-sm text-gray-500">
                Genera un reporte legible de tus tarjetas
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Exportar CSV"
            >
              <FileSpreadsheet className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
