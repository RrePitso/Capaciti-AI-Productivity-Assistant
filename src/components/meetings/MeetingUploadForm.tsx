// src/components/meetings/MeetingUploadForm.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label, Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Meeting, MeetingSummary, Task } from '@/types/database';

export interface SummaryResult {
  meeting: Meeting;
  summary: MeetingSummary;
  tasks: Task[];
}

export function MeetingUploadForm({ onResult }: { onResult: (result: SummaryResult) => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Programme Review');
  const [transcript, setTranscript] = useState('');

  const analyze = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<{ data: SummaryResult }>('/api/ai/summary', {
        title,
        meetingType,
        transcript,
      });
      return data.data;
    },
    onSuccess: (data) => {
      onResult(data);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Transcript</CardTitle>
      </CardHeader>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          analyze.mutate();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="title">Meeting Title</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="meetingType">Meeting Type</Label>
            <Select id="meetingType" value={meetingType} onChange={(e) => setMeetingType(e.target.value)}>
              <option>Programme Review</option>
              <option>Facilitator Sync</option>
              <option>Stakeholder Update</option>
              <option>Learner Check-in</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="transcript">Transcript / Notes</Label>
          <Textarea
            id="transcript"
            rows={10}
            required
            placeholder="Paste the meeting transcript or raw notes here…"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>

        {analyze.isError && (
          <p className="text-sm text-red-600">Something went wrong analysing the transcript. Try again.</p>
        )}

        <Button type="submit" className="w-full" loading={analyze.isPending}>
          <Sparkles className="h-4 w-4" />
          Analyze with AI
        </Button>
      </form>
    </Card>
  );
}
