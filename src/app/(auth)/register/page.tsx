// src/app/(auth)/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import type { UserRole } from '@/types/database';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('facilitator');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Profile row is created by a DB trigger (see supabase/migrations) that
    // reads raw_user_meta_data on auth.users insert. We fall back to an
    // explicit upsert here in case the trigger hasn't been applied yet.
    if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role,
        } as any);
      }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-capaciti-grey-light px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-capaciti-navy">Create your account</h1>
          <p className="text-sm text-capaciti-grey">Join the CAPACITI AI Assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="learner">Learner</option>
              <option value="facilitator">Facilitator</option>
              <option value="manager">Programme Manager</option>
              <option value="admin">Administrator</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-capaciti-grey">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-capaciti-blue">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
