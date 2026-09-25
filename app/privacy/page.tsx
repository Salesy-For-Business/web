import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Salesy",
  description:
    "How Salesy collects, uses, shares, and protects information — including Google Sign-In data — for sellers, buyers, and visitors on salesy.link.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const UPDATED = "September 25, 2026";

const ul = "list-disc space-y-2 pl-5";

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        Salesy (“Salesy,” “we,” “us,” “our”) operates salesy.link, a platform
        that lets entrepreneurs create an online store with a unique,
        shareable URL (for example, salesy.link/yourstore) and accept
        payments by card, bank transfer, or USSD. This Privacy Policy
        explains what information we collect from sellers who open a store,
        the customers who buy from those stores, and anyone who visits
        salesy.link; how we use and share it; and the choices available to
        you.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>
          We collect the information described below when you create an
          account, set up a store, place an order, leave a review, or
          otherwise use Salesy.
        </p>
        <p className="font-medium text-heading">Account information</p>
        <ul className={ul}>
          <li>First and last name, email address, and phone number.</li>
          <li>
            A password (stored only as a one-way hash, never in plain text)
            if you sign up with email — or, if you choose “Continue with
            Google,” the basic Google profile described in{" "}
            <a href="#google-sign-in" className="text-link hover:underline">
              Sign in with Google
            </a>{" "}
            below.
          </li>
          <li>Whether your email address has been verified.</li>
        </ul>
        <p className="font-medium text-heading">Store / business information</p>
        <ul className={ul}>
          <li>
            Business name, business email and phone, description, and
            optional physical address.
          </li>
          <li>
            Optional logo and social-share image you upload for your
            storefront, and the store’s unique URL handle.
          </li>
          <li>
            Owner details (name, role, email, phone) and, if you tell us your
            business is registered, its CAC registration number.
          </li>
          <li>
            If you enable live chat, which third-party provider you chose
            (e.g. Smartsupp, Tawk.to, Crisp, Tidio, JivoChat) and the widget
            code you pasted in.
          </li>
        </ul>
        <p className="font-medium text-heading">Product content</p>
        <ul className={ul}>
          <li>
            Listings you create — names, descriptions, prices, categories,
            stock levels, and photos you upload.
          </li>
        </ul>
        <p className="font-medium text-heading">
          Order and customer information
        </p>
        <ul className={ul}>
          <li>
            When someone checks out on a Salesy store (as a guest — no buyer
            account is required), we collect their name, email, phone
            number, delivery address or pickup note, order notes, and the
            items and amount ordered.
          </li>
          <li>
            This information is shared with the seller whose store received
            the order, so they can fulfill and communicate about it.
          </li>
        </ul>
        <p className="font-medium text-heading">Reviews</p>
        <ul className={ul}>
          <li>
            A reviewer’s name, star rating, and review text, linked to the
            order they’re reviewing.
          </li>
        </ul>
        <p className="font-medium text-heading">Payment information</p>
        <ul className={ul}>
          <li>
            Payments are processed by Paystack. Salesy never receives or
            stores full card numbers, CVVs, or bank login credentials — we
            only receive a transaction reference, status, and amount from
            Paystack to confirm your order.
          </li>
          <li>
            To pay out a seller’s balance, we collect the bank name and
            account number they enter, which we send to Paystack to resolve
            the account holder’s name and process the transfer.
          </li>
          <li>
            Sellers set a payout PIN to authorize withdrawals; it is used
            only to confirm withdrawal requests are made by the account
            owner.
          </li>
        </ul>
        <p className="font-medium text-heading">
          Cookies and local storage
        </p>
        <ul className={ul}>
          <li>
            A session cookie that keeps you signed in, and short-lived
            cookies used only during the “Continue with Google” flow (to
            prevent request forgery and to briefly hold your verified Google
            profile while you finish setting up your account).
          </li>
          <li>
            Your browser’s local storage holds your shopping cart, theme
            preference (light/dark/system), and session state — this stays
            on your device and is not sent to our servers except as part of
            normal page requests.
          </li>
        </ul>
        <p className="font-medium text-heading">Usage and log data</p>
        <ul className={ul}>
          <li>
            Standard web server logs — IP address, browser and device type,
            pages visited, and timestamps — used for security, abuse
            prevention, and diagnosing issues.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "google-sign-in",
    title: "Sign in with Google",
    body: (
      <>
        <p>
          If you choose “Continue with Google,” we ask Google for your name,
          email address, and whether Google has verified that email — the
          minimum needed to create or sign you into your Salesy account. We
          do not request access to your Gmail, Drive, Contacts, or any other
          Google service, and we do not receive your Google password.
        </p>
        <p>
          We use this information only to identify you and create or match
          your Salesy account — never for advertising, and never shared with
          third parties except the service providers described in{" "}
          <a href="#how-we-share" className="text-link hover:underline">
            How we share information
          </a>{" "}
          who help us run the platform (for example, our database host,
          strictly to store your account record).
        </p>
        <p>
          Salesy’s use and transfer of information received from Google APIs
          adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
            className="text-link hover:underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use information",
    body: (
      <ul className={ul}>
        <li>Create, secure, and let you sign into your Salesy account.</li>
        <li>Publish and operate your storefront at your chosen URL.</li>
        <li>
          Process orders and payments, verify bank accounts for payouts, and
          pay sellers their balance.
        </li>
        <li>
          Send transactional emails and one-time verification codes (account
          verification, password resets, order confirmations).
        </li>
        <li>
          Generate the preview image and description shown when a store or
          product link is shared on social media.
        </li>
        <li>Provide optional live chat on your storefront, if you enable it.</li>
        <li>
          Detect and prevent fraud, abuse, and security incidents, and
          enforce our{" "}
          <Link href="/terms" className="text-link hover:underline">
            Terms of Service
          </Link>
          .
        </li>
        <li>Improve Salesy’s features and reliability.</li>
        <li>Comply with legal obligations.</li>
      </ul>
    ),
  },
  {
    id: "how-we-share",
    title: "How we share information",
    body: (
      <>
        <p>We do not sell personal information. We share it only:</p>
        <ul className={ul}>
          <li>
            <span className="font-medium text-heading">
              With the relevant seller
            </span>{" "}
            — a buyer’s order details go to the store they ordered from, so
            it can be fulfilled.
          </li>
          <li>
            <span className="font-medium text-heading">
              With service providers
            </span>{" "}
            who process data on our behalf, under agreements limiting them to
            the services they provide us:
            <ul className={`${ul} mt-2`}>
              <li>MongoDB Atlas — database hosting.</li>
              <li>Cloudinary — image hosting for logos and product photos.</li>
              <li>
                Paystack — payment processing and bank account verification.
              </li>
              <li>Brevo (Sendinblue) — transactional email and OTP delivery.</li>
              <li>Google — “Continue with Google” authentication.</li>
              <li>
                A seller’s chosen live-chat provider (Smartsupp, Tawk.to,
                Crisp, Tidio, JivoChat, or another widget) — only on stores
                where the seller has turned this on; that provider’s own
                privacy policy governs what it collects from your visitors.
              </li>
            </ul>
          </li>
          <li>
            <span className="font-medium text-heading">For legal reasons</span>{" "}
            — to comply with law, respond to lawful requests, or protect the
            rights, safety, or property of Salesy, our users, or the public.
          </li>
          <li>
            <span className="font-medium text-heading">
              In a business transfer
            </span>{" "}
            — if Salesy is involved in a merger, acquisition, or sale of
            assets, with notice to affected users.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: (
      <p>
        We use a minimal set of cookies described in{" "}
        <a
          href="#information-we-collect"
          className="text-link hover:underline"
        >
          Information we collect
        </a>
        , all necessary for signing in and completing the Google sign-in
        flow — we don’t use third-party advertising or cross-site tracking
        cookies. A seller who enables live chat may cause that provider to
        set its own cookies on the storefront; that’s between the visitor and
        the provider under its own policy.
      </p>
    ),
  },
  {
    id: "data-retention",
    title: "Data retention",
    body: (
      <p>
        We keep account, store, and order records for as long as your
        account is active and for a reasonable period afterward to meet
        legal, accounting, and dispute-resolution obligations (for example,
        transaction records). Short-lived sign-in cookies expire
        automatically within minutes. You can request deletion of your
        account as described in{" "}
        <a href="#your-rights" className="text-link hover:underline">
          Your rights and choices
        </a>
        .
      </p>
    ),
  },
  {
    id: "security",
    title: "Data security",
    body: (
      <p>
        We use industry-standard safeguards — encrypted connections (HTTPS),
        hashed passwords, signed and HTTP-only session cookies, and access
        controls on our database — to protect your information. No method of
        transmission or storage is 100% secure, so we can’t guarantee
        absolute security, but we work to protect your data and to respond
        quickly if something goes wrong.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights and choices",
    body: (
      <ul className={ul}>
        <li>
          Access or correct your account and store information any time from
          your dashboard.
        </li>
        <li>
          Request a copy of your data, or ask us to delete your account and
          associated personal information, by contacting us below — we’ll
          respond within a reasonable time, subject to any records we’re
          required to keep by law.
        </li>
        <li>Turn off live chat on your store at any time from Settings.</li>
        <li>
          Clear your browser’s cookies and local storage to remove your
          session and cart data from that device.
        </li>
      </ul>
    ),
  },
  {
    id: "children",
    title: "Children’s privacy",
    body: (
      <p>
        Salesy is intended for entrepreneurs and shoppers who are at least
        18 years old, or the age of majority in their jurisdiction. We do not
        knowingly collect personal information from children. If you believe
        a child has provided us with personal information, contact us and
        we’ll delete it.
      </p>
    ),
  },
  {
    id: "international-transfers",
    title: "International data transfers",
    body: (
      <p>
        Salesy is built for entrepreneurs in Nigeria, and our service
        providers may process and store data outside your home country
        (for example, on cloud infrastructure operated internationally). We
        require our service providers to protect your information consistent
        with this policy wherever it’s processed.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. If we make
        material changes, we’ll update the “Last updated” date above and, for
        significant changes, provide additional notice (such as an email or
        an in-app notice).
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        Questions about this policy or your information? Email us at{" "}
        <a
          href="mailto:privacy@salesy.link"
          className="text-link hover:underline"
        >
          privacy@salesy.link
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro={
        <p>
          This policy applies to salesy.link and every store hosted on it.
          By creating a Salesy account, opening a store, or placing an order
          through a Salesy-hosted storefront, you agree to the collection and
          use of information as described here. If you don’t agree, please
          don’t use Salesy.
        </p>
      }
      sections={sections}
    />
  );
}
