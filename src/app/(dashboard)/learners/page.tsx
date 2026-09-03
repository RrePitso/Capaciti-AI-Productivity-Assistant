// src/app/(dashboard)/learners/page.tsx
import { LearnerList } from '@/components/learners/LearnerList';

export default function LearnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-capaciti-navy">Learner Support</h1>
        <p className="text-sm text-capaciti-grey">
          Overview of learners and their task and email activity.
        </p>
      </div>
      <LearnerList />
    </div>
  );
}