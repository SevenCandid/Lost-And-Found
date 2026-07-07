import { InfoPageLayout } from '../../components/InfoPageLayout'

export function PrivacyPolicyPage() {
  return (
    <InfoPageLayout title="Privacy Policy">
      <div className="space-y-6 text-sm">
        <p className="text-slate-500 italic">Last Updated: July 2026</p>
        
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Information We Collect</h2>
          <p className="mb-2">We collect information you provide directly to us when using Lost & Found:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account information (Name, Email, Department)</li>
            <li>Content you post (Item descriptions, locations, photos)</li>
            <li>Messages sent through our secure chat system</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. How We Use Your Information</h2>
          <p className="mb-2">We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Facilitate the matching and return of lost items</li>
            <li>Provide secure, anonymized communication between users</li>
            <li>Send push notifications (if enabled) regarding your items and messages</li>
            <li>Maintain the safety and security of the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Information Sharing</h2>
          <p>
            Your privacy is our priority. We <strong>do not</strong> sell your personal data. 
            Your contact information (email, phone number) is never displayed publicly or shared with other users. 
            Communication happens entirely within our encrypted chat system.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. 
            Our databases are secured using Row Level Security (RLS) to ensure users can only access their own private data and authorized chats.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@veroseven.com.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  )
}
