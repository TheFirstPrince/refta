import { useState } from 'react';
import { useLogin } from '../api/hooks';
import { Button, Card, Input } from '../components/ui';
import { useAuthStore } from '../store/auth';

export function LoginPage() {
  const login = useLogin();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('admin@refta.local');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login.mutateAsync({ email, password });
      setAuth(data.accessToken, data.user);
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-sm">
        <h2 className="mb-4 text-lg font-semibold">Вход в Refta</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">Войти</Button>
        </form>
      </Card>
    </div>
  );
}
