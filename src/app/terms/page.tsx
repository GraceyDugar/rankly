import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata = { title: `Terms of Service — ${site.name}` };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="October 18, 2026">
      <p>
        These terms cover your use of {site.name} ({site.url.replace(/^https?:\/\//, "")}), an AI visibility tracker.
        By using the site or subscribing, you agree to them.
      </p>

      <h2>What {site.name} does</h2>
      <p>
        {site.name} asks AI assistants questions you choose, records whether your business is
        recommended and which competitors appear, and sends you reports with suggested improvements. Results reflect AI
        answers at the time of each check. AI answers vary between runs and over time.
      </p>

      <h2>No guarantees</h2>
      <p>
        We don&apos;t control AI assistants and <strong>can&apos;t guarantee</strong> that your business will be recommended,
        ranked, or that any suggestion will improve results. Reports are provided for information only and aren&apos;t
        professional, legal or financial advice.
      </p>

      <h2>Subscriptions and billing</h2>
      <ul>
        <li>New subscriptions start with a {site.trialDays}-day free trial. Your card is charged ${site.price} when the trial ends, unless you cancel before then.</li>
        <li>After the trial, the plan costs ${site.price} per month and renews automatically each month until cancelled.</li>
        <li>Payments are processed by our payment partner, Dodo Payments, which acts as merchant of record. We never see or store your card details.</li>
        <li>You can cancel anytime. Cancelling stops future renewals. See our <a href="/refund">Refund Policy</a>.</li>
        <li>We may change prices with at least 30 days&apos; notice by email. Founding-member prices stay locked while your subscription remains active.</li>
      </ul>

      <h2>Free check</h2>
      <p>The free check on our homepage is limited per visitor and may be changed or removed at any time.</p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>abuse, overload, scrape or attempt to break the service or its limits;</li>
        <li>submit unlawful, harmful or misleading content;</li>
        <li>resell the service without our written permission.</li>
      </ul>
      <p>We may suspend accounts that break these rules.</p>

      <h2>Your content</h2>
      <p>
        You keep ownership of the brand names, websites and questions you submit. You give us permission to use them only to
        provide the service, including sending them to the AI providers we use.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We aim to keep {site.name} running reliably but can&apos;t promise it will be uninterrupted or error-free. We may
        improve, change or discontinue features. If we shut down the paid service, we&apos;ll give notice and stop charging you.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent allowed by law, {site.name} is provided &ldquo;as is&rdquo;, and our total liability for any claim is
        limited to the amount you paid us in the 3 months before the claim.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms. If changes are significant, we&apos;ll notify subscribers by email.</p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalPage>
  );
}
