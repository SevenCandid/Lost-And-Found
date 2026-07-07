import { InfoPageLayout } from '../../components/InfoPageLayout'
import { LifeBuoy, FileQuestion, ShieldCheck, Mail } from 'lucide-react'

export function HelpCenterPage() {
  const faqs = [
    {
      q: "How do I claim a found item?",
      a: "When you see an item you've lost in the 'Found' section, click on it and press 'Claim this'. You'll be asked to provide a hidden detail (like a lock screen, specific scratch, or contents) to prove ownership."
    },
    {
      q: "Are my details shared?",
      a: "No. Your phone number, email, and exact location are kept private. All communication happens through our secure, in-app messaging system."
    },
    {
      q: "What does the checkmark next to a message mean?",
      a: "A single gray checkmark means your message was sent. Two blue checkmarks mean the recipient has opened the chat and seen your message."
    },
    {
      q: "How do I edit or delete a report?",
      a: "Go to your Profile page and look under 'My Reports'. Tap on the item, and you'll find options to Edit or Mark as Resolved."
    }
  ]

  return (
    <InfoPageLayout title="Help Center">
      <div className="space-y-8">
        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-3xl text-center">
          <LifeBuoy className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">We're here to help</h2>
          <p className="text-sm">Browse our frequently asked questions or get in touch with support.</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileQuestion className="text-primary-500" size={20} />
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">{faq.q}</h4>
                <p className="text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="text-primary-500" size={20} />
            Safety Tips
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Never share personal passwords or financial information in chats.</li>
            <li>Meet in public, well-lit places when exchanging items (like campus security, library lobbies, or cafes).</li>
            <li>Verify ownership thoroughly before handing an item over.</li>
          </ul>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Mail className="text-primary-500" size={20} />
            Contact Support
          </h3>
          <p className="text-sm mb-4">Still need help? Our team is available to assist you.</p>
          <a href="mailto:support@veroseven.com" className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            Email Support
          </a>
        </div>
      </div>
    </InfoPageLayout>
  )
}
