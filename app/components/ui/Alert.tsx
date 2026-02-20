import clsx from 'clsx'

export function Alert({
                          className,
                          variant = 'info',
                          ...props
                      }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'info' | 'error' }) {
    const styles =
        variant === 'error'
            ? 'border-red-200 bg-red-50 text-red-900'
            : 'border-slate-200 bg-slate-50 text-slate-900'

    return (
        <div
            className={clsx('rounded-xl border px-4 py-3 text-sm', styles, className)}
            {...props}
        />
    )
}
