'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Alert } from '@/app/components/ui/Alert'
import { Spinner } from '@/app/components/ui/Spinner'
import { api, type DatasetDetails } from '@/app/lib/api'
import { EmgChart } from '@/app/components/chart/EmgChart'

export function ChartPageClient() {
    const params = useParams<{ id: string }>()
    const id = useMemo(() => {
        const raw = params?.id
        return Array.isArray(raw) ? raw[0] : raw
    }, [params])

    const [data, setData] = useState<DatasetDetails | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return

        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const res = await api.getDataset(id)
                if (!cancelled) setData(res)
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Не удалось загрузить данные.'
                if (!cancelled) setError(message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [id])

    if (!id) {
        return (
            <Card>
                <CardContent className="p-5">
                    <Alert variant="error">
                        Не удалось получить идентификатор набора данных из URL.
                    </Alert>
                    <div className="mt-4">
                        <Link href="/">
                            <Button variant="secondary">На главную</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="text-sm font-medium">
                    ID набора: <span className="text-slate-600">{id}</span>
                </div>
                <div className="text-xs text-slate-600">
                    Zoom: колесо мыши, Pan: перетаскивание
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Spinner size={18} /> Загрузка данных...
                    </div>
                ) : error ? (
                    <>
                        <Alert variant="error">
                            {error.includes('not found') || error.includes('404')
                                ? 'Набор данных не найден. Возможно, такого id не существует.'
                                : error.includes('Failed to fetch')
                                    ? 'Сервер недоступен. Проверьте, что backend запущен.'
                                    : error}
                        </Alert>
                        <Link href="/">
                            <Button variant="secondary">Вернуться на главную</Button>
                        </Link>
                    </>
                ) : data ? (
                    <>
                        <div className="text-sm">
                            Файл/набор данных: <span className="text-slate-600">{data.name}</span>
                        </div>
                        <EmgChart series={data.series} />
                        <Link href="/">
                            <Button variant="secondary">Назад</Button>
                        </Link>
                    </>
                ) : null}
            </CardContent>
        </Card>
    )
}