import Image from 'next/image';
import Link from 'next/link';

export function AuthHeader() {
  return (
    <header className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
      <Link href="/" className="relative block h-8 w-32">
        <Image
          src="/image/wds-logo.svg"
          alt="WebDev Studios"
          fill
          className="object-contain"
          sizes="128px"
          priority
        />
      </Link>
    </header>
  );
}
