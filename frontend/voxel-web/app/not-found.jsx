import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="h-dvh grid place-items-center pb-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center">
          <h1 className="text-3xl border-r border-zinc-400 px-3">404</h1>
          <p className="text-sm px-3">Page not found</p>
        </div>
        <Link
          href="/"
          className="text-sm dark:text-zinc-400 text-zinc-700 underline-offset-4 underline"
        >
          Back Home
        </Link>
      </div>
    </section>
  );
}
