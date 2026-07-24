import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center md:px-6 px-4 text-center">
      <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
        404
      </span>

      <h1 className="mt-6 text-4xl font-bold md:text-5xl">Page not found</h1>

      <p className="mt-4 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <Link href="/" className="mt-8">
        <Button className="rounded-full px-8 py-5">Back to Home</Button>
      </Link>
    </main>
  );
}
