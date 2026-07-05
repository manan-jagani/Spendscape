import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-6">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Spendscape
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Frontend foundation ready.
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          The product experience will be built here.
        </p>
      </div>
    </main>
  );
}
