import Link from "next/link";



export default function NotFound() {

  return (

    <div className="mx-auto max-w-2xl px-6 py-20 text-center">

      <h1 className="text-3xl font-semibold text-slate-900">

        Faqja nuk u gjet

      </h1>

      <p className="mt-2 text-slate-600">

        Faqja që kërkuat nuk ekziston ose është zhvendosur.

      </p>

      <Link href="/" className="btn-primary mt-6 inline-flex">

        Kthehu te kreu

      </Link>

    </div>

  );

}

