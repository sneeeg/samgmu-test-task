export const API_URL = 'http://localhost:8000'

export type DatasetListItem = { id: number; name: string }

export type DatasetPoint = {
    timestamp: number
    emg1: number
    emg2: number
    emg3: number
    emg4: number
    angle: number
}

export type DatasetDetails = {
    id: number
    name: string
    stats: {
        mean: Record<'emg1' | 'emg2' | 'emg3' | 'emg4' | 'angle', number>
        max: Record<'emg1' | 'emg2' | 'emg3' | 'emg4' | 'angle', number>
        peaks: number
    }
    series: DatasetPoint[]
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, init)

    if (!res.ok) {
        let message = `HTTP ${res.status}`
        try {
            const data = await res.json()
            if (data?.error) message = data.error
        } catch {}
        throw new Error(message)
    }

    return res.json() as Promise<T>
}

export const api = {
    listDatasets: () => apiFetch<DatasetListItem[]>('/api/datasets'),

    getDataset: (id: string | number) =>
        apiFetch<DatasetDetails>(`/api/dataset/${id}`),

    createDataset: async (datasetName: string, file: File) => {
        const fd = new FormData()
        fd.append('dataset_name', datasetName)
        fd.append('file', file)

        return apiFetch<{ id: number; message: string }>('/api/dataset', {
            method: 'POST',
            body: fd,
        })
    },
}