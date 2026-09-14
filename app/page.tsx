import {
  Cta,
  Faq,
  Features,
  Footer,
  Header,
  Help,
  Hero,
  Pricing,
  Sections,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Help />
        <Features />
        <Sections />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
