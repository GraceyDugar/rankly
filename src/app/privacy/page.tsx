import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata = { title: `Privacy Policy — ${site.name}` };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="October 18, 2026">
      <p>
        This policy explains what {site.name} collects, why, and who we share it with. We collect as little as we can and
        never sell your data.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Free checks:</strong> the brand and question you enter, the result, and a one-way hash of your IP address (used only to limit free checks; we never store your actual IP).</li>
        <li><strong>Early access list:</strong> your email and, optionally, your brand name.</li>
        <li><strong>Subscribers:</strong> your email, your brand name and website, your questions, your weekly results, and your subscription status.</li>
        <li><strong>Payments:</strong> handled entirely by Dodo Payments. We receive your subscription status and an ID, never your card details.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To run AI visibility checks and send you reports.</li>
        <li>To manage your subscription and contact you about your account.</li>
        <li>To prevent abuse of the free check.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>We use trusted services to run {site.name}. Each receives only what it needs:</p>
      <ul>
        <li><strong>Google (Gemini API):</strong> your brand name and questions, to generate AI answers.</li>
        <li><strong>Supabase:</strong> our database.</li>
        <li><strong>Cloudflare:</strong> website hosting and security.</li>
        <li><strong>Resend:</strong> sending report emails.</li>
        <li><strong>Dodo Payments:</strong> payments and billing.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We don&apos;t use advertising or tracking cookies. The only cookie we set is a login cookie for our own admin area.
        To count visits we use Cloudflare Web Analytics, which is cookie-free and doesn&apos;t track you across sites.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep subscriber data while your subscription is active and for up to 12 months after, so you can come back to your
        history. You can ask us to delete it sooner at any time.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct, export or delete your data by emailing{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. We&apos;ll respond within 30 days.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy in a meaningful way, we&apos;ll update this page and notify subscribers by email.</p>
    </LegalPage>
  );
}
