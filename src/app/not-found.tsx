// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-capaciti-grey-light text-center">
      <h1 className="text-2xl font-semibold text-capaciti-navy">Page not found</h1>
      <p className="text-sm text-capaciti-grey">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/dashboard" className="mt-2 text-sm font-medium text-capaciti-blue">
        Back to dashboard
      </Link>
    </div>
  );
}
