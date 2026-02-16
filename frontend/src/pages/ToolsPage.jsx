import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"
import CardGrid from "@/components/CardGrid"
import InfoCard from "@/components/InfoCard"

export default function ToolsPage() {
  const theme = useTheme()
  const [tools] = useState([
    { id: 1, name: "Web Search", description: "Search the internet for information", icon: "🔍" },
    { id: 2, name: "Code Executor", description: "Execute and run code snippets", icon: "💻" },
    { id: 3, name: "File Manager", description: "Manage and manipulate files", icon: "📁" },
    { id: 4, name: "API Caller", description: "Make HTTP requests to APIs", icon: "🌐" },
    { id: 5, name: "Data Analyzer", description: "Analyze and visualize data", icon: "📊" },
  ])

  return (
    <Layout>
      <Container>
        <PageHeader 
          title="Available Tools"
          subtitle="Powerful tools to enhance your productivity"
        />
        
        <CardGrid 
          items={tools}
          columns="auto"
          gap={8}
          renderCard={(tool) => (
            <div>
              <div style={{ fontSize: theme.typography.fontSize.xl3, marginBottom: theme.spacing[4] }}>
                {tool.icon}
              </div>
              <InfoCard
                title={tool.name}
                description={tool.description}
              />
            </div>
          )}
        />
      </Container>
    </Layout>
  )
}
