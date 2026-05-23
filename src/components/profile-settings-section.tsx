"use client";

import { Mail, User } from "lucide-react";
import { IconInput } from "@/components/icon-input";
import { roleLabelSq } from "@/lib/roles";
import { useSession } from "@/lib/store";

export function ProfileSettingsSection() {
  const user = useSession((s) => s.user);
  const role = useSession((s) => s.role);

  return (
    <section id="profili" className="card scroll-mt-24 space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Profili im</h2>
        <p className="mt-1 text-sm text-slate-600">
          Të dhënat e llogarisë suaj. (Në prototip, ndryshimet ruhen vetëm
          lokalisht.)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Emri
          </label>
          <IconInput
            id="profile-name"
            icon={User}
            type="text"
            defaultValue={user?.name ?? ""}
            readOnly
            className="bg-slate-50"
          />
        </div>
        <div>
          <label
            htmlFor="profile-email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <IconInput
            id="profile-email"
            icon={Mail}
            type="email"
            defaultValue={user?.email ?? ""}
            readOnly
            className="bg-slate-50"
          />
        </div>
      </div>

      {role ? (
        <p className="text-sm text-slate-600">
          Roli: <span className="font-medium text-slate-800">{roleLabelSq(role)}</span>
        </p>
      ) : null}

      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
        Për ndryshime të email-it ose fjalëkalimit, kontaktoni administratorin e
        klinikës — funksionaliteti i plotë vjen në versionin e ardhshëm.
      </p>
    </section>
  );
}
