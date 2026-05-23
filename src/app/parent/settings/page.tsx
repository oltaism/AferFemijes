"use client";



import { PageHeader } from "@/components/page-header";
import { ProfileSettingsSection } from "@/components/profile-settings-section";
import { SafetyBanner } from "@/components/safety-banner";

import { useSession } from "@/lib/store";



export default function ParentSettingsPage() {

  const simpleMode = useSession((s) => s.simpleMode);

  const setSimpleMode = useSession((s) => s.setSimpleMode);



  return (

    <div className="space-y-8">

      <PageHeader
        backHref="/parent"
        backLabel="Kthehu te paneli"
        title="Cilësimet"
        description="Qasje dhe privatësi."
      />



      <ProfileSettingsSection />

      <div className="grid gap-6 lg:grid-cols-2">

        <section className="card space-y-4 p-6">

          <h2 className="text-lg font-semibold text-slate-900">

            Qasshmëri dhe gjithëpërfshirje

          </h2>

          <p className="text-sm text-slate-600">

            Vetëm shqip.

          </p>



          <label className="flex items-start gap-3">

            <input

              type="checkbox"

              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600"

              checked={simpleMode}

              onChange={(e) => setSimpleMode(e.target.checked)}

            />

            <span>

              <span className="block text-sm font-medium text-slate-700">

                Modalitet i thjeshtë

              </span>

              <span className="text-xs text-slate-500">

                Butona dhe fusha më të mëdha.

              </span>

            </span>

          </label>



          <ul className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">

            <li>• Ikona të shoqëruara me etiketa tekstuale</li>

            <li>• Kontrast i lartë i ngjyrave</li>

            <li>• Strukturë e përshtatshme për lexues ekrani</li>

            <li>• Modalitet i infermierit pa internet (konceptual)</li>

          </ul>

        </section>



        <section className="card space-y-3 p-6">

          <h2 className="text-lg font-semibold text-slate-900">

            Privatësia dhe siguria

          </h2>

          <ul className="space-y-2 text-sm text-slate-700">

            <li>• Ruhen vetëm të dhënat e nevojshme shëndetësore.</li>

            <li>• Qasje sipas rolit — prindi sheh vetëm fëmijët e tij.</li>

            <li>• Mjeku sheh vetëm fëmijët e caktuar.</li>

            <li>• Shëndeti publik sheh vetëm të dhëna të grumbulluara.</li>

            <li>• Asnjë ekspozim publik i të dhënave private të fëmijëve.</li>

            <li>

              • Vendimet e ndjeshme mjekësore duhet të konfirmohen nga

              profesionistë të licencuar.

            </li>

          </ul>

          <SafetyBanner />

        </section>

      </div>

    </div>

  );

}

