"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { IconInput } from "@/components/icon-input";
import { login, registerParent } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { DEMO_EMAIL_BY_ROLE, roleLabelSq } from "@/lib/roles";
import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
      onClick={onToggle}
      aria-label={show ? "Fsheh fjalëkalimin" : "Shfaq fjalëkalimin"}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

export function AuthPanel({
  role,
  onSuccess,
  onBack,
}: {
  role: Role;
  onSuccess: (accessToken: string, user: import("@/lib/api/auth").AuthUser) => void;
  onBack: () => void;
}) {
  const canRegister = role === "parent";
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    setError(null);
  }, [mode, email, password, name, confirmPassword, acceptTerms]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Plotësoni email-in dhe fjalëkalimin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await login(email.trim(), password, role);
      if (res.user.role !== role) {
        setError(
          `Kjo llogari është për «${roleLabelSq(res.user.role)}», jo për «${roleLabelSq(role)}». Zgjidhni rolin e duhur ose përdorni email-in e saktë.`,
        );
        setLoading(false);
        return;
      }
      onSuccess(res.accessToken, res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gabim gjatë hyrjes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("Shkruani emrin e plotë (të paktën 2 karaktere).");
      return;
    }
    if (!email.trim()) {
      setError("Shkruani email-in.");
      return;
    }
    if (password.length < 6) {
      setError("Fjalëkalimi duhet të ketë të paktën 6 karaktere.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Fjalëkalimet nuk përputhen.");
      return;
    }
    if (!acceptTerms) {
      setError("Duhet të pranoni kushtet e përdorimit.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await registerParent({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      onSuccess(res.accessToken, res.user);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gabim gjatë regjistrimit.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {canRegister ? (
        <div
          className="flex rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Lloji i hyrjes"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Lock className="h-4 w-4" aria-hidden />
            Hyr
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => setMode("register")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              mode === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Krijo llogari
          </button>
        </div>
      ) : (
        <h2 className="text-lg font-semibold text-slate-900">Hyr në llogari</h2>
      )}

      <p className="mt-3 text-sm text-slate-600">
        {mode === "login"
          ? `Hyrje si ${roleLabelSq(role)} — përdorni llogarinë që i përket këtij roli.`
          : "Regjistrohuni si prind për të ndjekur fëmijët tuaj."}
      </p>

      {mode === "login" ? (
        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
          <span className="font-medium text-slate-700">Llogari demo:</span>{" "}
          {DEMO_EMAIL_BY_ROLE[role]} · fjalëkalimi{" "}
          <span className="font-mono">demo123</span>
        </p>
      ) : null}

      {mode === "login" ? (
        <form className="mt-5 space-y-4" onSubmit={(e) => void handleLogin(e)}>
          <Field label="Email" id="auth-email">
            <IconInput
              id="auth-email"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="emri@shembull.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Fjalëkalimi" id="auth-password">
            <IconInput
              id="auth-password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              endSlot={
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              }
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Duke u lidhur…
              </>
            ) : (
              "Hyr"
            )}
          </button>
        </form>
      ) : (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => void handleRegister(e)}
        >
          <Field label="Emri i plotë" id="auth-name">
            <IconInput
              id="auth-name"
              icon={User}
              type="text"
              autoComplete="name"
              placeholder="p.sh. Blerta Hoxha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Email" id="auth-reg-email">
            <IconInput
              id="auth-reg-email"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="emri@shembull.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Fjalëkalimi" id="auth-reg-password">
            <IconInput
              id="auth-reg-password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Të paktën 6 karaktere"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              endSlot={
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              }
            />
          </Field>

          <Field label="Përsërit fjalëkalimin" id="auth-confirm">
            <IconInput
              id="auth-confirm"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              disabled={loading}
            />
            <span>
              Pranoj{" "}
              <span className="font-medium text-brand-700">
                kushtet e përdorimit
              </span>{" "}
              dhe politikën e privatësisë.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Duke krijuar llogarinë…
              </>
            ) : (
              "Krijo llogari"
            )}
          </button>
        </form>
      )}

      {error ? (
        <p
          className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-inset ring-rose-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className="mt-6 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Ndrysho rolin
      </button>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
