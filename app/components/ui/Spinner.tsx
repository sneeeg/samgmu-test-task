export function Spinner({ size = 18 }: { size?: number }) {
    return (
        <span
            className="inline-block animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"
            style={{ width: size, height: size }}
            aria-label="Загрузка"
        />
    )
}
