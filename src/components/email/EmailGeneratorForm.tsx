// src/components/email/EmailGeneratorForm.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Copy, Check, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label, Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { EmailRecord } from '@/types/database';

export function EmailGeneratorForm() {
  const queryClient = useQueryClient();
  const [recipientType, setRecipientType] = useState('learner');
  const [recipientName, setRecipientName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<EmailRecord | null>(null);

  const generate = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<{ data: EmailRecord }>('/api/ai/email', {
        recipientType,
        recipientName: recipientName || undefined,
        purpose,
        context,
      });
      return data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.email_body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Email Generator</CardTitle>
        </CardHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            generate.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="recipientType">Recipient Type</Label>
              <Select id="recipientType" value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                <option value="learner">Learner</option>
                <option value="facilitator">Facilitator</option>
                <option value="management">Management</option>
                <option value="stakeholder">Stakeholder</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="recipientName">Recipient Name (optional)</Label>
              <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              required
              placeholder="e.g. Follow up on missed check-in"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              rows={6}
              required
              placeholder="Add any relevant background the AI should use…"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          {generate.isError && (
            <p className="text-sm text-red-600">Something went wrong generating the email. Try again.</p>
          )}

          <Button type="submit" className="w-full" loading={generate.isPending}>
            <Sparkles className="h-4 w-4" />
            Generate Email
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>

        {!result ? (
          <p className="text-sm text-capaciti-grey">Your generated email will appear here.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Subject</Label>
              <Input value={result.subject ?? ''} onChange={(e) => setResult({ ...result, subject: e.target.value })} />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                rows={10}
                value={result.email_body ?? ''}
                onChange={(e) => setResult({ ...result, email_body: e.target.value })}
              />
            </div>
            <p className="text-xs text-capaciti-grey">
              Suggested next action: {result.suggested_next_action}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy} type="button">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button type="button">Send</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
