import clsx from 'clsx'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={clsx(
                'rounded-2xl border border-slate-200 bg-white shadow-sm',
                className
            )}
            {...props}
        />
    )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={clsx('p-5 border-b border-slate-100', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={clsx('p-5', className)} {...props} />
}
