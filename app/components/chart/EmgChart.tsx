'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
    Title,
    type ChartOptions,
    type ChartData,
    type Chart,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Line } from 'react-chartjs-2'
import { Button } from '@/app/components/ui/Button'
import type { DatasetPoint } from '@/app/lib/api'

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
    Title,
    zoomPlugin
)

type Channel = 'emg1' | 'emg2' | 'emg3' | 'emg4' | 'angle'
type XY = { x: number; y: number }

function lttb(data: XY[], threshold: number): XY[] {
    const n = data.length
    if (threshold >= n || threshold <= 2) return data
    const sampled: XY[] = []
    const bucketSize = (n - 2) / (threshold - 2)

    let a = 0
    sampled.push(data[a])

    for (let i = 0; i < threshold - 2; i++) {
        const start = Math.floor((i + 1) * bucketSize) + 1
        const end = Math.floor((i + 2) * bucketSize) + 1
        const bucketEnd = Math.min(end, n)

        let avgX = 0
        let avgY = 0
        const avgRange = bucketEnd - start
        for (let j = start; j < bucketEnd; j++) {
            avgX += data[j].x
            avgY += data[j].y
        }
        const denom = Math.max(1, avgRange)
        avgX /= denom
        avgY /= denom

        const rangeOffs = Math.floor(i * bucketSize) + 1
        const rangeTo = Math.floor((i + 1) * bucketSize) + 1

        let maxArea = -1
        let maxAreaPoint = data[rangeOffs]
        let nextA = rangeOffs

        for (let j = rangeOffs; j < rangeTo; j++) {
            const area = Math.abs(
                (data[a].x - avgX) * (data[j].y - data[a].y) -
                (data[a].x - data[j].x) * (avgY - data[a].y)
            )
            if (area > maxArea) {
                maxArea = area
                maxAreaPoint = data[j]
                nextA = j
            }
        }

        sampled.push(maxAreaPoint)
        a = nextA
    }

    sampled.push(data[n - 1])
    return sampled
}

function clampNumber(v: unknown): number | null {
    if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) return null
    return v
}

function pad2(n: number) {
    return String(n).padStart(2, '0')
}

function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const hh = Math.floor(totalSeconds / 3600)
    const mm = Math.floor((totalSeconds % 3600) / 60)
    const ss = totalSeconds % 60

    if (hh > 0) return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`
    return `${pad2(mm)}:${pad2(ss)}`
}

export function EmgChart({ series }: { series: DatasetPoint[] }) {
    const chartRef = useRef<Chart<'line'> | null>(null)

    const [channel, setChannel] = useState<Channel>('emg1')
    const [xWindow, setXWindow] = useState<{ min: number; max: number } | null>(null)

    const raw: XY[] = useMemo(() => {
        const out: XY[] = []
        out.length = 0

        for (let i = 0; i < series.length; i++) {
            const p = series[i] as any
            const x = Number(p.timestamp)
            const y = Number(p[channel])

            if (!Number.isFinite(x) || !Number.isFinite(y)) continue
            out.push({ x, y })
        }

        return out
    }, [series, channel])

    const maxX = useMemo(() => (raw.length ? raw[raw.length - 1].x : 0), [raw])

    const windowed: XY[] = useMemo(() => {
        if (!xWindow) return raw
        const min = xWindow.min
        const max = xWindow.max

        const out: XY[] = []
        for (let i = 0; i < raw.length; i++) {
            const x = raw[i].x
            if (x >= min && x <= max) out.push(raw[i])
        }
        return out.length ? out : raw
    }, [raw, xWindow])

    const threshold = useMemo(() => {
        const chart = chartRef.current
        const width = chart?.width ?? 1200
        return Math.max(1000, Math.min(9000, Math.floor(width * 2.8)))
    }, [xWindow, channel])

    const reduced: XY[] = useMemo(() => {
        if (windowed.length <= threshold) return windowed
        return lttb(windowed, threshold)
    }, [windowed, threshold])

    const data: ChartData<'line', XY[]> = useMemo(
        () => ({
            datasets: [
                {
                    label: channel.toUpperCase(),
                    data: reduced,

                    borderWidth: 2.5,
                    pointRadius: 0,
                    tension: 0.18,
                    fill: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.08)',
                },
            ],
        }),
        [reduced, channel]
    )

    const options: ChartOptions<'line'> = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,

            animation: false,
            parsing: false,
            normalized: true,

            elements: {
                point: { radius: 0, hitRadius: 0, hoverRadius: 0 },
                line: { borderWidth: 2.5 },
            },

            interaction: { mode: 'index', intersect: false },

            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        title: (items) => {
                            const raw0 = items?.[0]?.raw as any
                            const x = raw0?.x
                            if (typeof x !== 'number') return ''
                            return `t = ${formatDuration(x)}`
                        },
                        label: (item) => {
                            const r = item.raw as any
                            const y = r?.y
                            return typeof y === 'number' ? `${channel.toUpperCase()}: ${y}` : ''
                        },
                    },
                },
                zoom: {
                    pan: { enabled: true, mode: 'x' },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'x',
                    },
                    limits: { x: { min: 'original', max: 'original' } },
                    onZoomComplete: ({ chart }) => {
                        const s = chart.scales.x
                        const min = clampNumber(s.min)
                        const max = clampNumber(s.max)
                        if (min != null && max != null) setXWindow({ min, max })
                    },
                    onPanComplete: ({ chart }) => {
                        const s = chart.scales.x
                        const min = clampNumber(s.min)
                        const max = clampNumber(s.max)
                        if (min != null && max != null) setXWindow({ min, max })
                    },
                } as any,
                title: { display: false },
            },

            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Время от начала' },
                    ticks: {
                        maxTicksLimit: 8,
                        callback: (value) => {
                            const v = typeof value === 'number' ? value : Number(value)
                            if (!Number.isFinite(v)) return ''
                            return formatDuration(v)
                        },
                    },
                    grid: {
                        color: 'rgba(2, 6, 23, 0.06)',
                    },
                },
                y: {
                    type: 'linear',
                    title: { display: true, text: channel.toUpperCase() },
                    ticks: { maxTicksLimit: 6 },
                    grid: {
                        color: 'rgba(2, 6, 23, 0.06)',
                    },
                },
            },
        }),
        [channel]
    )

    useEffect(() => {
        setXWindow(null)
        const chart = chartRef.current as any
        if (chart?.resetZoom) chart.resetZoom()
    }, [channel])

    const resetZoom = () => {
        setXWindow(null)
        const chart = chartRef.current as any
        if (chart?.resetZoom) chart.resetZoom()
    }

    if (!raw.length) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                Нет валидных данных для канала <b>{channel.toUpperCase()}</b>.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {(['emg1', 'emg2', 'emg3', 'emg4', 'angle'] as Channel[]).map((c) => (
                        <button
                            key={c}
                            onClick={() => setChannel(c)}
                            className={[
                                'h-9 rounded-xl border px-3 text-sm transition',
                                c === channel
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-200 bg-white hover:bg-slate-50',
                            ].join(' ')}
                        >
                            {c.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:block text-xs text-slate-600">
                        Колесо — zoom, drag — pan
                    </div>
                    <Button variant="secondary" onClick={resetZoom}>
                        Reset zoom
                    </Button>
                </div>
            </div>

            <div className="h-[380px] w-full rounded-2xl border border-slate-200 bg-white p-3">
                <Line
                    ref={(instance) => {
                        chartRef.current = instance as unknown as Chart<'line'>
                    }}
                    data={data}
                    options={options}
                />
            </div>

            <div className="text-xs text-slate-600">
                Отрисовка ускорена: динамический downsampling (LTTB) под текущий zoom.
                Длина серии: <b>{series.length.toLocaleString('ru-RU')}</b>, на экране: <b>{reduced.length.toLocaleString('ru-RU')}</b>.
            </div>
        </div>
    )
}