// src/components/learners/LearnerList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { LearnerActivitySummary } from '@/types';

export function LearnerList() {
  const [learners, setLearners] = useState<LearnerActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/learners')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load learners');
        if (!cancelled) setLearners(json.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-capaciti-grey">Loading learners...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (learners.length === 0) {
    return <p className="text-sm text-capaciti-grey">No learners found.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {learners.map((learner) => (
        <Card key={learner.id}>
          <CardHeader>
            <CardTitle>{learner.full_name}</CardTitle>
            {learner.department && (
              <Badge tone="blue">{learner.department}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-1">
            <p>
              Tasks: {learner.taskSummary.completed}/{learner.taskSummary.total} completed
              {learner.taskSummary.pending > 0 && (
                <span className="ml-2">
                  <Badge tone="amber">{learner.taskSummary.pending} pending</Badge>
                </span>
              )}
            </p>
            <p>Emails sent: {learner.emailsSent}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}