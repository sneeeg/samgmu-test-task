'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Spinner } from '@/app/components/ui/Spinner'
import { Alert } from '@/app/components/ui/Alert'
import { FileDropzone } from './FileDropzone'
import { api } from '@/app/lib/api'

export function UploadCard() {
    const router = useRouter()

    const [file, setFile] = useState<File | null>(null)
    const [datasetName, setDatasetName] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canSubmit = useMemo(() => {
        return Boolean(file) && datasetName.trim().length > 0 && !isUploading
    }, [file, datasetName, isUploading])

    const onSubmit = async () => {
        if (!file || isUploading) return
        if (!datasetName.trim()) {
            setError('Укажите название набора данных.')
            return
        }

        setError(null)
        setIsUploading(true)

        try {
            const res = await api.createDataset(datasetName.trim(), file)
            router.push(`/chart/${res.id}`)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Не удалось загрузить файл.'
            setError(message.includes('Failed to fetch') ? 'Сервер недоступен. Проверьте запуск backend.' : message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="text-sm font-medium">Загрузка данных</div>
                <div className="text-xs text-slate-600">
                    Выберите Excel-файл (.xlsx) и задайте имя набора данных
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                {error ? <Alert variant="error">{error}</Alert> : null}

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-700">Название набора данных</label>
                    <input
                        value={datasetName}
                        onChange={(e) => setDatasetName(e.target.value)}
                        placeholder="Например: Тренировка 20.02"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    />
                </div>

                <FileDropzone value={file} onChange={setFile} />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button onClick={onSubmit} disabled={!canSubmit} className="w-full sm:w-auto">
                        {isUploading ? (
                            <span className="inline-flex items-center gap-2">
                <Spinner size={16} />
                Загрузка...
              </span>
                        ) : (
                            'Загрузить'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}