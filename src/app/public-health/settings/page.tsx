"use client";



import { PageHeader } from "@/components/page-header";
import { ProfileSettingsSection } from "@/components/profile-settings-section";
import { SafetyBanner } from "@/components/safety-banner";



export default function PublicHealthSettings() {

  return (

    <div className="space-y-8">

      <PageHeader

        title="Cilësimet e shëndetit publik"

        description="Të dhëna dhe ndërfaqe."

      />

      <ProfileSettingsSection />

      <div className="grid gap-6 lg:grid-cols-2">

        <section className="card space-y-3 p-6">

          <h2 className="text-lg font-semibold text-slate-900">Gjuha</h2>

          <p className="text-sm text-slate-700">

            Vetëm shqip.

          </p>

        </section>

        <section className="card space-y-3 p-6">

          <h2 className="text-lg font-semibold text-slate-900">

            Qeverisja e të dhënave

          </h2>

          <p className="text-sm text-slate-700">

            Vetëm të dhëna <strong>të grumbulluara</strong> — pa profile individuale
            fëmijësh.

          </p>

          <SafetyBanner />

        </section>

      </div>

    </div>

  );

}

