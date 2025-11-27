import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { CreateDeck } from "./pages/CreateDeck";
import { StudySession } from "./pages/StudySession";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateDeck />} />
            <Route path="edit/:id" element={<CreateDeck />} />
            <Route path="study/:id" element={<StudySession />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
