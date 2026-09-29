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
import { AosInit } from "@/components/landing/aos-init";
import { getPublicPlans } from "@/lib/plan-config";
import { defaultPublicPlans, type PublicPlan } from "@/lib/plan-defaults";

export const revalidate = 60;

async function loadPlans(): Promise<PublicPlan[]> {
  try {
    return await getPublicPlans();
  } catch (err) {
    console.error("[home] falling back to default plans", err);
    return defaultPublicPlans();
  }
}

export default async function Home() {
  const plans = await loadPlans();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <AosInit />
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Help />
        <Features />
        <Sections />
        <Pricing plans={plans} />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
