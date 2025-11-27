import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { AppData, Deck, AppSettings } from "../types";

interface AppContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  fileHandle: FileSystemFileHandle | null;
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  isDirty: boolean;
  lastSaved: Date | null;
  addDeck: (deck: Deck) => void;
  updateDeck: (deck: Deck) => void;
  deleteDeck: (deckId: string) => void;
  updateSettings: (settings: AppSettings) => void;
}

const defaultSettings: AppSettings = {
  againMinutes: 1,
  hardMinutes: 5,
  goodMinutes: 10,
  easyDays: 4,
};

const defaultData: AppData = {
  decks: [],
  settings: defaultSettings,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<AppData>(defaultData);
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveFile = useCallback(async () => {
    if (!fileHandle) return;

    try {
      // @ts-ignore - File System Access API
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      setLastSaved(new Date());
      setIsDirty(false);
      console.log("Saved successfully");
    } catch (err) {
      console.error("Error saving file:", err);
      alert(
        "Error al guardar. Es posible que necesites dar permisos nuevamente."
      );
    }
  }, [fileHandle, data]);

  // Auto-save effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (fileHandle && isDirty) {
      interval = setInterval(() => {
        saveFile();
      }, 60000); // Auto-save every 1 minute
    }
    return () => clearInterval(interval);
  }, [fileHandle, isDirty, saveFile]);

  const openFile = async () => {
    try {
      // @ts-ignore - File System Access API
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
        multiple: false,
      });

      const file = await handle.getFile();
      const text = await file.text();
      const json = JSON.parse(text);

      // Validate basic structure (simple check)
      if (!json.decks || !json.settings) {
        alert("Archivo inválido. Falta estructura de decks o settings.");
        return;
      }

      setFileHandle(handle);
      setData(json);
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (err) {
      console.error("Error opening file:", err);
    }
  };

  const addDeck = (deck: Deck) => {
    setData((prev) => ({ ...prev, decks: [...prev.decks, deck] }));
    setIsDirty(true);
  };

  const updateDeck = (updatedDeck: Deck) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)),
    }));
    setIsDirty(true);
  };

  const deleteDeck = (deckId: string) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.filter((d) => d.id !== deckId),
    }));
    setIsDirty(true);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setData((prev) => ({ ...prev, settings: newSettings }));
    setIsDirty(true);
  };

  return (
    <AppContext.Provider
      value={{
        data,
        setData,
        fileHandle,
        openFile,
        saveFile,
        isDirty,
        lastSaved,
        addDeck,
        updateDeck,
        deleteDeck,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
