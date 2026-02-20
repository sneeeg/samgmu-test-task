'use client'

import { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'

type Props = {
    value: File | null
    onChange: (file: File | null) => void
    accept?: string
}

export function FileDropzone({ value, onChange, accept = '.xlsx' }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const openPicker = useCallback(() => {
        inputRef.current?.click()
    }, [])

    const handlePick = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] ?? null
            onChange(file)
        },
        [onChange]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragging(false)

            const file = e.dataTransfer.files?.[0] ?? null
            if (!file) return
            if (!file.name.toLowerCase().endsWith('.xlsx')) {
                onChange(null)
                return
            }
            onChange(file)
        },
        [onChange]
    )

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handlePick}
            />

            <div
                onClick={openPicker}
                onDragEnter={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                }}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                className={clsx(
                    'rounded-2xl border-2 border-dashed p-6 transition cursor-pointer select-none',
                    isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                )}
            >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm font-medium">
                            Перетащи файл сюда или нажми, чтобы выбрать
                        </div>
                        <div className="text-xs text-slate-600">Поддерживается формат: .xlsx</div>
                    </div>

                    <div className="mt-3 sm:mt-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white">
                        Выбрать файл
                    </div>
                </div>

                <div className="mt-4 text-sm">
                    {value ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="font-medium">{value.name}</div>
                            <div className="text-xs text-slate-600">
                                {(value.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500">Файл не выбран</div>
                    )}
                </div>
            </div>
        </div>
    )
}
