'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Input, Text } from 'tharaday';

import { getApiUrl } from '@/consts/api';
import {
  AuthSession,
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from '@/lib/auth';

function getErrorMessageFromPayload(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const data = payload as { message?: unknown; error?: unknown };
  if (typeof data.message === 'string' && data.message) {
    return data.message;
  }
  if (typeof data.error === 'string' && data.error) {
    return data.error;
  }

  return fallback;
}

export default function AccountPage() {
  const router = useRouter();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const authSession = readAuthSession();
    setSession(authSession);
    setName(authSession?.user.name || '');
    setEmail(authSession?.user.email || '');
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      setError('You need to sign in first.');
      return;
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      setError('Name and email are required.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: Record<string, unknown> = {
        id: session.user.id,
        name: normalizedName,
        email: normalizedEmail,
      };

      if (password) {
        payload.password = password;
      }

      const response = await fetch(getApiUrl('/users'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessageFromPayload(
            responsePayload,
            `Failed to update account (${response.status})`,
          ),
        );
      }

      const updatedUser = responsePayload as {
        id: number;
        name: string;
        email: string;
        role_id: number | null;
        status_id: number | null;
      };

      const nextSession: AuthSession = {
        token: session.token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role_id: updatedUser.role_id,
          status_id: updatedUser.status_id,
        },
      };

      writeAuthSession(nextSession);
      setSession(nextSession);
      setName(nextSession.user.name);
      setEmail(nextSession.user.email);
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('Your account has been updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!session) {
      return;
    }

    const confirmed = window.confirm(
      'Delete your account permanently? This cannot be undone.',
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `${getApiUrl('/users')}?id=${encodeURIComponent(String(session.user.id))}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        },
      );

      if (!response.ok && response.status !== 204) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          getErrorMessageFromPayload(
            payload,
            `Failed to delete account (${response.status})`,
          ),
        );
      }

      clearAuthSession();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  }

  if (!session) {
    return (
      <Box display="flex" justifyContent="center" paddingY="48px">
        <Card bordered shadow="sm" style={{ width: '100%', maxWidth: '32rem' }}>
          <CardContent>
            <Box display="flex" flexDirection="column" gap={3}>
              <Text variant="h2" weight="bold">
                Account
              </Text>
              <Text variant="body-md" color="subtle">
                Sign in to manage your account.
              </Text>
              <Button intent="info" onClick={() => router.push('/login')}>
                Go to sign in
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" paddingY="48px">
      <Card bordered shadow="sm" style={{ width: '100%', maxWidth: '36rem' }}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={4}>
            <Text variant="h2" weight="bold">
              Manage account
            </Text>

            <form onSubmit={handleSave}>
              <Box display="flex" flexDirection="column" gap={3}>
                <Input
                  label="Name"
                  autoComplete="name"
                  fullWidth
                  value={name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setName(event.target.value)
                  }
                />
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
                  label="New password (optional)"
                  type="password"
                  autoComplete="new-password"
                  fullWidth
                  value={password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(event.target.value)
                  }
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(event.target.value)
                  }
                />

                {error ? (
                  <Text variant="body-sm" color="danger">
                    {error}
                  </Text>
                ) : null}

                {successMessage ? (
                  <Text variant="body-sm" color="success">
                    {successMessage}
                  </Text>
                ) : null}

                <Button type="submit" intent="info" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </Box>
            </form>

            <Box
              border
              borderColor="subtle"
              borderRadius="md"
              padding={3}
              backgroundColor="subtle"
            >
              <Text variant="body-sm" color="subtle" paddingBottom={2}>
                Danger zone
              </Text>
              <Button
                variant="outline"
                intent="danger"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? 'Deleting account...' : 'Delete account'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
