"use client";

import { useEffect, useRef, useState } from "react";

export default function LoginScreen({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const pwd = pin.join("");
    if (pwd.length === 4 && !loading) {
      verify(pwd);
    }
  }, [pin, loading]);

  async function verify(password: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid password");
      }
      
      // Store session token from response
      if (data.data?.token) {
        localStorage.setItem("vault_session_token", data.data.token);
      }
      // Also check for token in header
      const tokenHeader = res.headers.get("X-Session-Token");
      if (tokenHeader) {
        localStorage.setItem("vault_session_token", tokenHeader);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid password");
      setPin(["", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...pin];
    next[index] = value.slice(-1);
    setPin(next);
    setError("");
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{1,4}$/.test(pasted)) {
      const newPin = [...pin];
      for (let i = 0; i < 4; i++) {
        newPin[i] = pasted[i] || "";
      }
      setPin(newPin);
      const focusIndex = Math.min(pasted.length - 1, 3);
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus();
      }, 0);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Secure File Vault
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Enter your 4‑digit PIN to access your files
            </p>
          </div>
          <div className="flex justify-center gap-3">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="h-16 w-16 rounded-xl border-2 border-slate-700/50 bg-slate-800/50 text-center text-2xl font-semibold tracking-widest text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:bg-slate-800 focus:ring-4 focus:ring-cyan-400/20 disabled:opacity-50"
                disabled={loading}
                aria-label={`PIN digit ${idx + 1}`}
              />
            ))}
          </div>
          <div className="mt-6 h-6 text-center text-sm font-medium text-red-400 transition-opacity duration-200">
            {error && (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </span>
            )}
          </div>
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




