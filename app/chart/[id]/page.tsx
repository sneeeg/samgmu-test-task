import { Container } from '@/app/components/layout/Container'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { ChartPageClient } from '@/app/components/chart/ChartPageClient'

export default function ChartPage() {
    return (
        <Container>
            <PageHeader title="Визуализация" description="Просмотр данных набора" />
            <ChartPageClient />
        </Container>
    )
}