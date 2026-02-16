import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"
import CardGrid from "@/components/CardGrid"
import InfoCard from "@/components/InfoCard"
import BadgeLabel from "@/components/BadgeLabel"

export default function MCPServersPage() {
  const theme = useTheme()
  const [servers] = useState([
    { id: 1, name: "File System Server", type: "File Management", status: "success", icon: "📁" },
    { id: 2, name: "Web Server", type: "HTTP Client", status: "success", icon: "🌐" },
    { id: 3, name: "Database Server", type: "Data Access", status: "success", icon: "🗄️" },
    { id: 4, name: "API Gateway", type: "API Management", status: "success", icon: "🔌" },
  ])

  return (
    <Layout>
      <Container>
        <PageHeader title="MCP Servers" subtitle="Manage and configure Model Context Protocol servers" />
        <CardGrid items={servers} columns="auto" gap={8}
          renderCard={(server) => (
            <InfoCard
              title={<div style={{ fontSize: theme.typography.fontSize.xl3 }}>{server.icon}</div>}
              subtitle={server.name}
              description={server.type}
              footer={<BadgeLabel variant="success">Connected</BadgeLabel>}
            />
          )}
        />
      </Container>
    </Layout>
  )
}
