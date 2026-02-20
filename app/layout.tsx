import type { Metadata } from 'next'
import '@/app/styles/globals.css'

export const metadata: Metadata = {
    title: 'Личный кабинет',
    description: 'Визуализация данных мышечной активности',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <body>
        <div className="min-h-dvh bg-slate-50 text-slate-900">
            {children}
        </div>
        </body>
        </html>
    )
}
