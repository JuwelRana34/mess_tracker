"use client";

import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/client';
import { toast } from 'sonner';

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
      
    } catch (err: any) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Outer container: Flex column on mobile, row on large screens
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[hsl(var(--background))]">
      
      {/* ================= LEFT SIDE (Branding) ================= */}
      {/* Hidden on mobile, takes 50% width on large screens */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-[hsl(var(--muted))] relative flex-col justify-between p-12 border-r border-[hsl(var(--border))] overflow-hidden">
        
        {/* Subtle Background Gradients */}
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent z-0" />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center text-lg font-bold text-[hsl(var(--foreground))]">
          <Command className="mr-2 h-6 w-6 text-primary" />
          Acme Inc
        </div>

        {/* Testimonial / Quote */}
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium text-[hsl(var(--foreground))]">
              "This platform has completely transformed how we manage our internal processes. The speed, security, and reliability are unmatched."
            </p>
            <footer className="text-sm text-[hsl(var(--muted-foreground))]">
              Sofia Davis, CEO
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ================= RIGHT SIDE (Form) ================= */}
      {/* Full width on mobile, 50% width on large screens */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24">
        
        {/* Form Container with max-width for readability */}
        <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center space-y-6">
          
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            {/* Mobile-only Logo */}
            <div className="flex lg:hidden items-center justify-center text-lg font-bold mb-4">
              <Command className="mr-2 h-6 w-6 text-primary" />
              Acme Inc
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Enter your email and password to sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 w-full">
            {/* Global Error Banner */}
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20 text-center">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
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
                <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-all">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
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
              className="w-full relative group overflow-hidden mt-6" 
              disabled={isLoading}
            >
              <span className={`flex items-center justify-center transition-all duration-300 ${isLoading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
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
            Don't have an account?{" "}
            <a href="/signup" className="font-semibold text-primary hover:underline underline-offset-4 transition-all">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}