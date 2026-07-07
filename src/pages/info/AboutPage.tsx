import { InfoPageLayout } from '../../components/InfoPageLayout'

export function AboutPage() {
  return (
    <InfoPageLayout title="About Us">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Welcome to Lost & Found</h2>
          <p>
            Lost & Found is a modern, real-time platform designed to reconnect you with what matters most. 
            Whether you've misplaced your keys, wallet, or phone, our intelligent matching system helps securely connect finders with owners across your community or campus.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h2>
          <p>
            We believe that communities thrive when people help each other. 
            Our mission is to eliminate the stress of losing personal belongings by providing a seamless, privacy-first platform that facilitates safe returns.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">How It Works</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Report:</strong> Quickly post an item you've lost or found.</li>
            <li><strong>Match:</strong> Our system actively scans for similar items reported in your area.</li>
            <li><strong>Connect:</strong> Securely chat with the other party without exposing your personal phone number or email.</li>
            <li><strong>Verify:</strong> Owners answer private questions to verify ownership before hand-off.</li>
          </ul>
        </div>
      </div>
    </InfoPageLayout>
  )
}
