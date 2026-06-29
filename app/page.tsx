'use client'

import Link from 'next/link';



import { ArrowRight, CheckCircle, ShieldCheck, Zap } from 'lucide-react';



import { testPushAction } from '@/actions/testPush';
import { Button } from '@/components/ui/button';
import { sendPushNotification } from '@/lib/push';












































export default function HomePage() {


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="mb-6 text-5xl leading-tight font-extrabold text-gray-900 md:text-6xl dark:text-white">
          মেসের কাজ এখন হবে <br />
          <span className="text-blue-600">স্মার্ট ও অটোমেটেড!</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          ময়লা ফেলার ডিউটি থেকে টয়লেট পরিষ্কার— সবকিছুর হিসাব থাকবে আপনার পকেটে।
          ফাঁকিবাজির দিন শেষ, এখন সবার কাজ হবে সময়ের সাথে।
        </p>
      
        <div className="flex justify-center gap-4">
          <Link href="/profile">
            <Button
              size="lg"
              className="bg-blue-600 px-8 text-lg text-white hover:bg-blue-700"
            >
              এখনই শুরু করুন <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-yellow-500" />}
            title="অটোমেটেড ডিউটি"
            desc="ক্রন জব সিস্টেম নিজে থেকেই ডিউটি অ্যাসাইন করবে, কাউকে আর মনে করিয়ে দিতে হবে না।"
          />
          <FeatureCard
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="কাজ কমপ্লিট ট্র্যাকিং"
            desc="কাজ শেষ করলে সাথে সাথে আপডেট করুন। মিস করলে পেনাল্টি পয়েন্ট আপনার স্কিপ ক্রেডিট থেকে কাটা যাবে।"
          />
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-blue-500" />}
            title="স্মার্ট পেনাল্টি"
            desc="কেউ কাজ ফেলে রাখলে তাকে শাস্তি দেওয়ার জন্য আমাদের রয়েছে ক্রেডিট কাটার অটোমেটেড সিস্টেম।"
          />
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="container mx-auto border-t px-6 py-12 text-center dark:border-gray-800">
        <p className="text-gray-500">
          © 2026 আপনার মেস অ্যাপ। সব অধিকার সংরক্ষিত।
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  )
}
