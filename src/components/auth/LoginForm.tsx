'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, remember);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
          Email hoặc Tên đăng nhập
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="manager@parking.vn"
          required
          className="w-full"
          disabled={isLoading}
        />
      </div>

      {/* Password Field */}
      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
          Mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked as boolean)}
            disabled={isLoading}
          />
          <Label
            htmlFor="remember"
            className="text-sm text-gray-900 cursor-pointer font-normal"
          >
            Ghi nhớ đăng nhập
          </Label>
        </div>
        <a
          href="#"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Quên mật khẩu?
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
}
