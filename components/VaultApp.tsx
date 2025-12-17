"use client";

import { useState, useEffect } from "react";
import LoginScreen from "@/components/vault/LoginScreen";
import Dashboard from "@/components/vault/Dashboard";

export default function VaultApp() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const session = localStorage.getItem("vault_session");
    if (session) {
      setAuthed(true);
    }
  }, []);

  const handleSuccess = () => {
    localStorage.setItem("vault_session", "true");
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("vault_session");
    setAuthed(false);
  };

  if (!authed) {
    return <LoginScreen onSuccess={handleSuccess} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}




