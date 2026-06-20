export const getErrorMessage = (error: unknown): string => {
  // যদি এটা রেগুলার Error অবজেক্ট হয়
  if (error instanceof Error) {
    return error.message
  }

  // যদি Supabase বা অন্য কোনো কাস্টম অবজেক্ট হয় যার ভেতরে message আছে
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }

  // যদি স্ট্রিং হিসেবে কোনো এরর আসে
  if (typeof error === 'string') {
    return error
  }

  // যদি কোনোভাবেই না মেলে
  return 'An unexpected error occurred. Please try again.'
}
