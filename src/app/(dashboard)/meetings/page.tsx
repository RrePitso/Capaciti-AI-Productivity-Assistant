// src/app/(dashboard)/meetings/page.tsx
'use client';

import { useState } from 'react';
import { MeetingUploadForm, type SummaryResult } from '@/components/meetings/MeetingUploadForm';
import { SummaryView } from '@/components/meetings/SummaryView';

export default function MeetingsPage() {
  const [result, setResult] = useState<SummaryResult | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-capaciti-navy">Meeting Notes Summarizer</h1>
        <p className="text-sm text-capaciti-grey">
          Convert notes or transcripts into actionable summaries, with tasks created automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MeetingUploadForm onResult={setResult} />
        {result ? (
          <SummaryView result={result} />
        ) : (
          <div className="flex items-center justify-center rounded-card border border-dashed border-border p-8 text-sm text-capaciti-grey">
            Your AI-generated summary will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
