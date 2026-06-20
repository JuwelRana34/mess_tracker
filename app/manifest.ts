import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'amadermess Duty Reminder',
    short_name: 'amadermess',
    description: 'A Progressive Web App for managing mess duties',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '../iconmess.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '../iconmess.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
