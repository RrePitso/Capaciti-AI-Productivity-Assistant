// src/components/layout/AiAssistantPanel.tsx
'use client';

import { Sparkles, X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const QUICK_PROMPTS = [
  'Draft a follow-up email to a stakeholder',
  'Summarise my last meeting transcript',
  'Suggest priorities for today\u2019s tasks',
  'Generate this month\u2019s progress report',
];

export function AiAssistantPanel() {
  const { aiPanelOpen, setAiPanelOpen } = useUIStore();

  if (!aiPanelOpen) {
    return (
      <Button
        onClick={() => setAiPanelOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-card"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-4 w-4" />
        Ask AI
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-capaciti-blue" /> How can I help?
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setAiPanelOpen(false)} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <div className="mb-3 space-y-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            className="w-full rounded-card border border-border px-3 py-2 text-left text-xs text-capaciti-navy hover:bg-capaciti-grey-light"
          >
            {prompt}
          </button>
        ))}
      </div>

      <Input placeholder="Ask anything…" />
    </Card>
  );
}
