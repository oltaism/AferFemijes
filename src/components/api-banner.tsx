export function ApiBanner({
  error,
}: {
  fromApi?: boolean;
  error?: string | null;
}) {
  if (!error) return null;

  return (
    <p
      className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-inset ring-amber-200"
      role="status"
    >
      Nuk u arrit lidhja me shërbimin. Të dhënat mund të mos jenë të përditësuara.
    </p>
  );
}
