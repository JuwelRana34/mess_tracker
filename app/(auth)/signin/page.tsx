"use client";

import React, { useState } from 'react';



import { ArrowRight, Command, Loader2, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';



import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/client';
import { getErrorMessage } from '@/lib/errorHandler';
import Link from 'next/link';














export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        throw supabaseError; 
      }

      toast.success("Login successful!");
      window.location.href = '/'; 
      
    } catch (err) {
     setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Outer container: Flex column on mobile, row on large screens
    <div className="flex min-h-screen w-full flex-col bg-[hsl(var(--background))] lg:flex-row">
      {/* ================= LEFT SIDE (Branding) ================= */}
      {/* Hidden on mobile, takes 50% width on large screens */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-12 lg:flex lg:w-1/2">
        {/* Subtle Background Gradients */}
        <div className="bg-primary/5 absolute inset-0 z-0" />
        <div className="from-primary/10 absolute top-0 left-0 z-0 h-full w-full bg-gradient-to-br to-transparent" />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center text-lg font-bold text-[hsl(var(--foreground))]">
          <Command className="text-primary mr-2 h-6 w-6" />
          Acme Inc
        </div>

        {/* Testimonial / Quote */}
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium text-[hsl(var(--foreground))]">
              &quot;This platform has completely transformed how we manage our
              internal processes. The speed, security, and reliability are
              unmatched.&quot;
            </p>
            <footer className="text-sm text-[hsl(var(--muted-foreground))]">
              Sofia Davis, CEO
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ================= RIGHT SIDE (Form) ================= */}
      {/* Full width on mobile, 50% width on large screens */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 md:p-24 lg:w-1/2">
        {/* Form Container with max-width for readability */}
        <div className="mx-auto flex w-full max-w-[420px] flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            {/* Mobile-only Logo */}
            <div className="mb-4 flex items-center justify-center text-lg font-bold lg:hidden">
              <Command className="text-primary mr-2 h-6 w-6" />
              Acme Inc
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Enter your email and password to sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            {/* Global Error Banner */}
            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="email"
                  name="email" /* name attribute is REQUIRED for FormData */
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="text-primary text-sm font-medium underline-offset-4 transition-all hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute top-2.5 left-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="password"
                  name="password" /* name attribute is REQUIRED for FormData */
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="group relative mt-6 w-full overflow-hidden"
              disabled={isLoading}
            >
              <span
                className={`flex items-center justify-center transition-all duration-300 ${isLoading ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>

              {isLoading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <p className="px-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary font-semibold underline-offset-4 transition-all hover:underline"
            >
              Sign up
            </Link>
            <br />
            <Link
              href="/"
              className="text-primary font-semibold underline-offset-4 transition-all hover:underline capitalize underline mt-2 inline-block"
            >
              back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}