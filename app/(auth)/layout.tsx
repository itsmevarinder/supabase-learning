import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — image panel */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/50" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <Image src="/logo.png" alt="" width={88} height={88} priority className="w-22 animate-spin-linear" />
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight">Build better products, faster.</h2>
            <p className="mt-4 text-white/80">
              Join thousands of teams already using CMS to plan, build, and ship their best work.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-8 text-2xl font-bold tracking-tight lg:hidden">
          <Image src="/logo.png" alt="" width={48} height={48} className="w-12 animate-spin-linear" />
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
