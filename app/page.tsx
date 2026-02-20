import { Container } from '@/app/components/layout/Container'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { UploadCard } from '@/app/components/upload/UploadCard'

export default function HomePage() {
  return (
      <Container>
        <PageHeader
            title="Личный кабинет"
            description="Загрузите файл с данными мышечной активности, чтобы построить график."
        />
        <UploadCard />
      </Container>
  )
}
