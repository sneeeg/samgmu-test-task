import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary'
}

export function Button({ className, variant = 'primary', ...props }: Props) {
    const base =
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed'

    const styles =
        variant === 'primary'
            ? 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'

    return <button className={clsx(base, styles, className)} {...props} />
}
