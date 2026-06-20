'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/client'

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      if (!data.name || !data.email || !data.password) {
        throw new Error('All fields are required.')
      }

      // Metadata hishebe 'name' pathano hocche
      const { data: signUpData, error: supabaseError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name, // Ei data ti Supabase er auth.users table a save hobe
            },
          },
        })

      if (supabaseError) {
        throw supabaseError
      }

      toast.success(
        'Sign up successful! Please check your email to confirm your account.'
      )
      window.location.replace('/signin')
      form.reset()
      console.log('Sign up successful!', signUpData)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong.')
        console.error('Error during sign up:', err.message)
      } else {
        console.error('Unexpected error during sign up:', err)
        toast.error('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[hsl(var(--background))] p-4 sm:p-8">
      <div className="w-full max-w-[400px]">
        {/* Card Container */}
        <div className="overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm">
          {/* Card Header */}
          <div className="flex flex-col space-y-1.5 p-6 pb-4">
            <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-md">
              <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-sm shadow-sm">
                <div className="bg-primary-foreground h-2 w-2 rounded-full" />
              </div>
            </div>
            <h3 className="text-2xl leading-none font-semibold tracking-tight">
              Create an account
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Enter your details below to sign up.
            </p>
          </div>

          {/* Card Content (Form) */}
          <div className="p-6 pt-0">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Error Message Display */}
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="MD. Juwel Rana"
                    required
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    id="email"
                    name="email"
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
                </div>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-9"
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="group relative w-full overflow-hidden"
                  disabled={isLoading}
                >
                  <span
                    className={`flex items-center justify-center transition-all duration-300 ${isLoading ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
                  >
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>

                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Card Footer */}
          <div className="flex items-center p-6 pt-0">
            <p className="w-full text-center text-sm text-[hsl(var(--muted-foreground))]">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </Link>{' '}
              <br />
              <Link
                href="/"
                className="text-primary mt-2 inline-block font-semibold capitalize underline underline-offset-4 transition-all hover:underline"
              >
                back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
