import clsx from 'clsx'

export function Container({
                              className,
                              ...props
                          }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={clsx('mx-auto w-full max-w-4xl px-4 py-8', className)}
            {...props}
        />
    )
}
