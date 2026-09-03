// src/components/meetings/SummaryView.tsx
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { SummaryResult } from './MeetingUploadForm';

function BulletList({ items }: { items: string[] | null }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-capaciti-grey">None identified.</p>;
  }
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-capaciti-navy">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function SummaryView({ result }: { result: SummaryResult }) {
  const { summary, tasks } = result;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <p className="text-sm text-capaciti-navy">{summary.executive_summary}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Discussions</CardTitle>
        </CardHeader>
        <BulletList items={summary.key_discussions} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Decisions</CardTitle>
          </CardHeader>
          <BulletList items={summary.decisions} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risks</CardTitle>
          </CardHeader>
          <BulletList items={summary.risks} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        {tasks.length === 0 ? (
          <p className="text-sm text-capaciti-grey">No action items were extracted.</p>
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-capaciti-navy">{task.title}</span>
                <Badge tone={task.priority === 'P1' ? 'red' : task.priority === 'P2' ? 'amber' : 'neutral'}>
                  {task.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
