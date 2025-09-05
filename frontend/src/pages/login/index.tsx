import React, { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  Github,
  Twitter,
  Facebook,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Lock as LockIcon,
} from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const socialProviders = [
    { icon: Github, name: "GitHub", color: "bg-gray-900 hover:bg-gray-800" },
    { icon: Twitter, name: "Twitter", color: "bg-blue-400 hover:bg-blue-500" },
    {
      icon: Facebook,
      name: "Facebook",
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>
            {t("welcomeBack")}
          </h1>
          <p className='text-white/80'>{t("loginToContinue")}</p>
        </div>

        <Card className='bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl'>
          {/* Social Login Buttons */}
          <div className='space-y-3 mb-6'>
            {socialProviders.map(({ icon: Icon, name, color }) => (
              <button
                key={name}
                disabled
                className={`relative w-full px-4 py-3 ${color} text-white rounded-xl opacity-75 cursor-not-allowed flex items-center justify-center font-medium transition-all`}>
                <Icon className='w-5 h-5 mr-3' />
                {t("continueWith")} {name}
                <span className='absolute right-3 text-xs bg-white/20 px-2 py-1 rounded'>
                  {t("comingSoon")}
                </span>
              </button>
            ))}
          </div>

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white text-gray-500'>
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2'>
                <AlertCircle className='w-5 h-5 flex-shrink-0' />
                <p className='text-sm'>{error}</p>
              </div>
            )}

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                {t("email")}
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200'
                  placeholder={t("enterEmail")}
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                {t("password")}
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200'
                  placeholder={t("enterPassword")}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-600'>{t("rememberMe")}</span>
              </label>
              <Link
                to='/forgot-password'
                className='text-sm text-blue-600 hover:text-blue-500'>
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transform hover:-translate-y-0.5 transition-all duration-200'>
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                  {t("signingIn")}
                </div>
              ) : (
                <>
                  <LogIn className='w-5 h-5 mr-2' />
                  {t("signIn")}
                </>
              )}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              {t("dontHaveAccount")}{" "}
              <Link
                to='/register'
                className='font-semibold text-blue-600 hover:text-blue-500'>
                {t("createAccount")}
              </Link>
            </p>
          </div>

          <div className='mt-8 pt-6 border-t border-gray-200'>
            <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
              <LockIcon className='w-4 h-4' />
              {t("secureLoginMessage")}
            </div>
          </div>
        </Card>

        <div className='mt-8 text-center'>
          <div className='flex justify-center space-x-4 text-sm text-white/80'>
            <Link to='/terms' className='hover:text-white'>
              {t("terms")}
            </Link>
            <span>•</span>
            <Link to='/privacy' className='hover:text-white'>
              {t("privacy")}
            </Link>
            <span>•</span>
            <Link to='/help' className='hover:text-white'>
              {t("help")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
