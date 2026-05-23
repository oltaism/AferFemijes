"use client";



import Link from "next/link";

import { useEffect } from "react";



export default function GlobalError({

  error,

  reset,

}: {

  error: Error & { digest?: string };

  reset: () => void;

}) {

  useEffect(() => {

    console.error(error);

  }, [error]);



  return (

    <div className="mx-auto max-w-2xl px-6 py-20 text-center">

      <h1 className="text-3xl font-semibold text-slate-900">

        Diçka shkoi keq

      </h1>

      <p className="mt-2 text-slate-600">

        Prototipi hasi një gabim të papritur. Ju lutemi provoni përsëri.

      </p>

      <div className="mt-6 flex justify-center gap-3">

        <button onClick={reset} className="btn-primary">

          Provo përsëri

        </button>

        <Link href="/" className="btn-secondary">

          Kthehu te kreu

        </Link>

      </div>

    </div>

  );

}

