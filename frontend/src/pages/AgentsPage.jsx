import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"
import CardGrid from "@/components/CardGrid"
import InfoCard from "@/components/InfoCard"
import BadgeLabel from "@/components/BadgeLabel"

export default function AgentsPage() {
  const theme = useTheme()
  const [agents] = useState([
    { id: 1, name: "Claude Haiku", provider: "Anthropic", description: "Fast and efficient AI assistant", status: "Active" },
    { id: 2, name: "GPT-4 Turbo", provider: "OpenAI", description: "Advanced multi-task AI model", status: "Active" },
    { id: 3, name: "Llama 2 70B", provider: "Meta", description: "Open-source large language model", status: "Active" },
  ])

  return (
    <Layout>
      <Container>
        <PageHeader 
          title="Available Agents"
          subtitle="Choose an AI agent to use for your tasks"
        />
        
        <CardGrid 
          items={agents}
          columns="auto"
          gap={8}
          renderCard={(agent) => (
            <InfoCard
              title={agent.name}
              subtitle={agent.provider}
              description={agent.description}
              footer={
                <BadgeLabel 
                  label={agent.status}
                  variant="success"
                  size="sm"
                />
              }
            />
          )}
        />
      </Container>
    </Layout>
  )
}
