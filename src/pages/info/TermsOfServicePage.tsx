import { InfoPageLayout } from '../../components/InfoPageLayout'

export function TermsOfServicePage() {
  return (
    <InfoPageLayout title="Terms of Service">
      <div className="space-y-6 text-sm">
        <p className="text-slate-500 italic">Last Updated: July 2026</p>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Lost & Found, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. User Conduct</h2>
          <p className="mb-2">You agree to use the platform only for its intended purpose: reporting and returning lost items. You must not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Post false, misleading, or fraudulent reports</li>
            <li>Claim items that do not belong to you</li>
            <li>Use the platform for any illegal or unauthorized purpose</li>
            <li>Harass, abuse, or harm other users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Content Moderation</h2>
          <p>
            We reserve the right to review, edit, or remove any content (including item reports and messages) that violates these terms or is deemed inappropriate. We may also suspend or terminate accounts for repeated violations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Disclaimer of Liability</h2>
          <p>
            Lost & Found is a platform to facilitate connections. We do not take possession of items and are not responsible for the condition, authenticity, or safe return of any items. Users arrange hand-offs at their own risk.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the platform following any changes indicates your acceptance of the new terms.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  )
}
