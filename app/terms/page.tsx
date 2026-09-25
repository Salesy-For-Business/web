import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — Salesy",
  description:
    "The terms that govern creating a store, selling, and buying on Salesy.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const UPDATED = "September 25, 2026";

const ul = "list-disc space-y-2 pl-5";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: (
      <p>
        These Terms of Service (“Terms”) govern your access to and use of
        Salesy — the salesy.link website, every store hosted on it, and our
        related dashboard and tools (together, the “Service”). By creating an
        account, opening a store, or placing an order on Salesy, you agree to
        these Terms and to our{" "}
        <Link href="/privacy" className="text-link hover:underline">
          Privacy Policy
        </Link>
        . If you’re agreeing on behalf of a business, you confirm you have
        authority to bind that business.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use Salesy",
    body: (
      <p>
        You must be at least 18 years old, or the age of majority where you
        live, to create a Salesy account or open a store. You’re responsible
        for making sure your use of Salesy complies with the laws that apply
        to you and your business.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <ul className={ul}>
        <li>
          You can sign up with an email and password or with “Continue with
          Google.” Either way, you’re responsible for keeping your login
          credentials, payout PIN, and any device signed into your account
          secure.
        </li>
        <li>
          One business per account. The information you give us — your name,
          business details, and contact information — must be accurate and
          kept up to date.
        </li>
        <li>
          You’re responsible for all activity that happens under your
          account. Tell us right away at{" "}
          <a
            href="mailto:support@salesy.link"
            className="text-link hover:underline"
          >
            support@salesy.link
          </a>{" "}
          if you suspect unauthorized access.
        </li>
      </ul>
    ),
  },
  {
    id: "seller-obligations",
    title: "Selling on Salesy",
    body: (
      <ul className={ul}>
        <li>
          Listings must be accurate — pricing, availability, and product
          descriptions and photos must represent what you’re actually
          selling.
        </li>
        <li>
          You may only list and sell goods and services that are lawful to
          sell in Nigeria (or the jurisdiction you operate in). Salesy may
          remove listings or suspend stores that violate this.
        </li>
        <li>
          You are the merchant of record for every sale from your store.
          You’re responsible for fulfilling orders, handling customer
          service, and processing returns or refunds with your customers —
          Salesy provides the storefront and payment plumbing, but the sale
          is between you and your buyer.
        </li>
        <li>
          If you tell us your business is CAC-registered, the registration
          number you provide must be accurate. You’re responsible for your
          own tax obligations (VAT, income tax, etc.) on sales you make.
        </li>
        <li>
          Any live-chat widget, promotional creative, or other third-party
          tool you add to your store is your choice and responsibility — see{" "}
          <a href="#third-party" className="text-link hover:underline">
            Third-party services
          </a>
          .
        </li>
      </ul>
    ),
  },
  {
    id: "buyer-terms",
    title: "Buying from a Salesy store",
    body: (
      <ul className={ul}>
        <li>
          You can check out as a guest — no buyer account is required. The
          name, email, phone number, and delivery details you provide are
          shared with the seller so they can fulfill your order.
        </li>
        <li>
          Payments are processed securely by Paystack. Salesy does not see or
          store your full card or bank login details.
        </li>
        <li>
          Because each seller is an independent business, order issues,
          returns, and refunds are handled directly with the seller you
          bought from, using the contact details shown on their store.
        </li>
      </ul>
    ),
  },
  {
    id: "fees-payments",
    title: "Fees, payouts, and your payout PIN",
    body: (
      <ul className={ul}>
        <li>
          Salesy’s Free plan applies a platform fee to each sale; paid plans
          (Boutique and Pro) carry no commission but may have a subscription
          fee. Current rates and plan limits are shown on our Pricing page
          and may change with notice.
        </li>
        <li>
          Paystack may separately charge standard payment-processing fees on
          each transaction.
        </li>
        <li>
          To withdraw your balance to a bank account, you set a payout PIN.
          You’re responsible for keeping it secret — withdrawals authorized
          with your correct PIN are treated as authorized by you.
        </li>
      </ul>
    ),
  },
  {
    id: "prohibited-conduct",
    title: "Prohibited conduct",
    body: (
      <ul className={ul}>
        <li>Listing illegal, counterfeit, stolen, or unsafe goods.</li>
        <li>
          Fraud, money laundering, or using Salesy to collect payment for
          goods or services you don’t intend to deliver.
        </li>
        <li>
          Attempting to access another user’s account, interfere with the
          Service, or reverse-engineer, scrape, or overload our systems.
        </li>
        <li>
          Uploading content that infringes someone else’s intellectual
          property or violates their rights.
        </li>
        <li>Impersonating another person or business.</li>
      </ul>
    ),
  },
  {
    id: "content-ownership",
    title: "Your content",
    body: (
      <p>
        You keep ownership of the store name, description, logo, and product
        listings you upload (“Your Content”). By uploading it, you grant
        Salesy a worldwide, non-exclusive license to host, display,
        reproduce, and distribute Your Content solely to operate and promote
        your store (including the preview image and description shown when
        your store or product links are shared on social media). You confirm
        you have the rights necessary to grant this license.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party services",
    body: (
      <p>
        Salesy integrates with third-party services to operate — including
        Paystack (payments), Cloudinary (image hosting), Brevo (email),
        Google (sign-in), and, if a seller enables it, a live-chat provider
        of their choosing. Your use of those services through Salesy is also
        subject to that provider’s own terms and privacy policy, and Salesy
        isn’t responsible for how they operate.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <p>
        You may close your account at any time. We may suspend or terminate
        access to the Service, or take down a listing or store, if we
        reasonably believe you’ve violated these Terms, created risk or
        legal exposure for Salesy or others, or if required by law — where
        practical, we’ll tell you why.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers and limitation of liability",
    body: (
      <p>
        The Service is provided “as is” and “as available,” without
        warranties of any kind. Salesy is a platform connecting sellers and
        buyers — we don’t manufacture, inspect, or guarantee any product sold
        through it. To the fullest extent permitted by law, Salesy is not
        liable for indirect, incidental, or consequential damages arising
        from your use of the Service, or from transactions between buyers and
        sellers.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    body: (
      <p>
        These Terms are governed by the laws of the Federal Republic of
        Nigeria, without regard to conflict-of-law principles. Any dispute
        arising from these Terms or the Service will be subject to the
        exclusive jurisdiction of the courts of Nigeria.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these Terms from time to time. If we make material
        changes, we’ll update the “Last updated” date above and, for
        significant changes, provide additional notice. Continuing to use
        Salesy after changes take effect means you accept the updated Terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        Questions about these Terms? Email us at{" "}
        <a
          href="mailto:support@salesy.link"
          className="text-link hover:underline"
        >
          support@salesy.link
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated={UPDATED}
      intro={
        <p>
          Please read these Terms carefully before creating a store or
          placing an order on Salesy. They explain what we expect from
          sellers and buyers, and what you can expect from us.
        </p>
      }
      sections={sections}
    />
  );
}
