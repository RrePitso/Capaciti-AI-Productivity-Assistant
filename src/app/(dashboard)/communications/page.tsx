// src/app/(dashboard)/communications/page.tsx
import { EmailGeneratorForm } from '@/components/email/EmailGeneratorForm';

export default function CommunicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-capaciti-navy">Smart Email Generator</h1>
        <p className="text-sm text-capaciti-grey">
          Generate stakeholder, learner, or management emails using AI. Send a professional
          communication in under 2 minutes.
        </p>
      </div>
      <EmailGeneratorForm />
    </div>
  );
}
