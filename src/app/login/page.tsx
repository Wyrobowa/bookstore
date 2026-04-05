'use client';

import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { Box, Button, Card, CardContent, Input, Text } from 'tharaday';

import { loginWithPassword } from '@/lib/auth-api';
import { writeAuthSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Please provide email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await loginWithPassword(normalizedEmail, password);
      writeAuthSession(session);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to sign in. Try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box display="flex" justifyContent="center" paddingY="48px">
      <Card bordered shadow="sm" style={{ width: '100%', maxWidth: '28rem' }}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={4}>
            <Text variant="h2" weight="bold">
              Sign in
            </Text>
            <Text variant="body-sm" color="subtle">
              Use your account email and password.
            </Text>

            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" gap={3}>
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(event.target.value)
                  }
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  value={password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(event.target.value)
                  }
                />

                {error ? (
                  <Text variant="body-sm" color="danger">
                    {error}
                  </Text>
                ) : null}

                <Button type="submit" intent="info" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </Box>
            </form>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
