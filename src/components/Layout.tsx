import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Brain, Save, FolderOpen } from "lucide-react";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/utils";

export const Layout: React.FC = () => {
  const { openFile, saveFile, isDirty, lastSaved } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Brain className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">
                FlashMind AI
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/create"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/create"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Crear Mazo
            </Link>
            <Link
              to="/settings"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/settings"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Configuración
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={openFile}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Abrir Archivo"
            >
              <FolderOpen className="w-5 h-5" />
            </button>
            <button
              onClick={saveFile}
              className={cn(
                "p-2 rounded-full transition-colors flex items-center gap-2",
                isDirty
                  ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                  : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
              )}
              title={
                lastSaved
                  ? `Guardado: ${lastSaved.toLocaleTimeString()}`
                  : "Guardar"
              }
            >
              <Save className="w-5 h-5" />
              {isDirty && (
                <span className="text-xs font-medium">Sin guardar</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};
