import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Eye, EyeOff, Loader2, Shield, User, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    setEmail(`${role}@example.com`);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-950 to-primary-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-accent-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/10 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-glow">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-white">Ramzan Group</span>
              <p className="text-[10px] text-primary-400 font-medium tracking-widest">MANAGEMENT SYSTEM</p>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
            Streamline Your<br />
            <span className="text-gradient">Fleet Operations</span>
          </h1>
          <p className="text-lg text-primary-300 max-w-md leading-relaxed mb-12">
            Manage entire fleet from one powerful dashboard. Track vehicles, employees, expenses, and more with ease.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              'Comprehensive financial management',
              'Employee & document management',
              'Automated alerts & notifications',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-primary-200">
                <div className="w-5 h-5 bg-success-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-success-400" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-100">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-glow mb-4">
              <Bus className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-primary-900">Ramzan Group</span>
          </div>

          {/* Form Card */}
          <div className="card p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-primary-900">Welcome back</h2>
              <p className="text-primary-500 mt-2">Sign in to continue to your dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-400 hover:text-primary-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Login */}
            <div className="mt-8 pt-6 border-t border-primary-100">
              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-4 text-center">
                Quick Access
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { role: 'admin', icon: Shield, label: 'Admin', color: 'from-danger-500 to-danger-600' },
                  { role: 'manager', icon: Users, label: 'Manager', color: 'from-warning-500 to-warning-600' },
                  { role: 'staff', icon: User, label: 'Staff', color: 'from-primary-500 to-primary-600' },
                ].map(({ role, icon: Icon, label, color }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => quickLogin(role)}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-4 border-2 border-dashed border-primary-200',
                      'transition-all duration-200 hover:border-accent-400 hover:bg-accent-50/50'
                    )}
                  >
                    <div className={clsx('w-8 h-8 bg-gradient-to-br flex items-center justify-center text-white', color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-primary-600">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-primary-400 mt-6">
            Ramzan Group DIP - Fleet Management System
          </p>
        </div>
      </div>
    </div>
  );
}
