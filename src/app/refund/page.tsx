import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata = { title: `Refund Policy — ${site.name}` };

export default function Refund() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated="October 18, 2026">
      <h2>Cancel anytime</h2>
      <p>
        {site.name} is a ${site.price}/month subscription with no contract. You can cancel at any time, and you won&apos;t be
        charged again. To cancel, use the link in your payment receipt or email{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> and we&apos;ll cancel it for you.
      </p>

      <h2>Free trial</h2>
      <p>
        Every subscription starts with a {site.trialDays}-day free trial. Cancel any time before it ends and you won&apos;t be
        charged at all.
      </p>

      <h2>Refunds</h2>
      <p>
        Because reports start right after you subscribe, <strong>we don&apos;t offer refunds for partial months</strong> or
        for months you didn&apos;t use.
      </p>
      <p>We <strong>will</strong> refund you if:</p>
      <ul>
        <li>you were charged by mistake or charged twice;</li>
        <li>you paid but never received a report because of a problem on our side;</li>
        <li>a refund is required by the consumer laws that apply to you.</li>
      </ul>
      <p>
        To request one, email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> within 14 days of the charge
        with the email you subscribed with. Approved refunds go back to your original payment method, processed by Dodo
        Payments, our payment partner.
      </p>

      <h2>Questions</h2>
      <p>
        If something isn&apos;t right, just email us before opening a dispute with your bank. We&apos;re a small team and
        we&apos;ll sort it out quickly.
      </p>
    </LegalPage>
  );
}
