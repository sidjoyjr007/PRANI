import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"
import CardGrid from "@/components/CardGrid"
import InfoCard from "@/components/InfoCard"

export default function LLMPage() {
  const theme = useTheme()
  const [models] = useState([
    { id: 1, name: "Claude 3 Opus", provider: "Anthropic", contextWindow: "200K", icon: "🧠" },
    { id: 2, name: "GPT-4 Turbo", provider: "OpenAI", contextWindow: "128K", icon: "⚡" },
    { id: 3, name: "Gemini Ultra", provider: "Google", contextWindow: "1M", icon: "✨" },
    { id: 4, name: "Llama 2 70B", provider: "Meta", contextWindow: "4K", icon: "🦙" },
  ])

  return (
    <Layout>
      <Container>
        <PageHeader title="Large Language Models" subtitle="Select and manage LLM providers and models" />
        <CardGrid items={models} columns="auto" gap={8}
          renderCard={(model) => (
            <InfoCard
              title={<div style={{ fontSize: theme.typography.fontSize.xl3 }}>{model.icon}</div>}
              subtitle={model.name}
              description={model.provider}
              footer={<div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground }}>Context: {model.contextWindow}</div>}
            />
          )}
        />
      </Container>
    </Layout>
  )
}
