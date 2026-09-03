// src/components/dashboard/ActivityFeed.tsx
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'email' | 'meeting' | 'task' | 'report';
  title: string;
  timestamp: string;
}

const TYPE_LABEL: Record<ActivityItem['type'], string> = {
  email: 'Email sent',
  meeting: 'Meeting summarised',
  task: 'Task updated',
  report: 'Report generated',
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      {items.length === 0 ? (
        <p className="text-sm text-capaciti-grey">No recent activity yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-capaciti-navy">{item.title}</p>
                <p className="text-xs text-capaciti-grey">{TYPE_LABEL[item.type]}</p>
              </div>
              <span className="text-xs text-capaciti-grey">{formatDate(item.timestamp)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
