"use client";

import { useState, useEffect } from "react";
import LoginScreen from "@/components/vault/LoginScreen";
import Dashboard from "@/components/vault/Dashboard";
import { getSessionToken, clearSessionToken } from "@/lib/api-client";

export default function VaultApp() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session token
    const token = getSessionToken();
    if (token) {
      // Verify token is still valid by making a test request
      fetch("/api/files", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Session-Token": token,
        },
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            setAuthed(true);
          } else {
            clearSessionToken();
            setAuthed(false);
          }
        })
        .catch(() => {
          clearSessionToken();
          setAuthed(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleSuccess = () => {
    setAuthed(true);
  };

  const handleLogout = () => {
    clearSessionToken();
    setAuthed(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onSuccess={handleSuccess} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}




