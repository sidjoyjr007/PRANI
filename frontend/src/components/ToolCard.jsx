import { useTheme } from "@/context/ThemeContext"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"

export default function ToolCard({ tool }) {
  const theme = useTheme()

  return (
    <Card
      variant="default"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: theme.spacing[4],
        transition: `all ${theme.transitions.normal}`,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.lg
        e.currentTarget.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 3px 0 ${theme.colors.shadow}20`
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      {/* Tool Name */}
      <Text
        as="h3"
        variant="label"
        size="md"
        style={{
          margin: 0,
          color: theme.colors.foreground,
        }}
      >
        {tool.name}
      </Text>

      {/* Tool Description */}
      <Text
        as="p"
        variant="body"
        size="sm"
        style={{
          margin: 0,
          color: theme.colors.muted_foreground,
          flex: 1,
          lineHeight: theme.typography.lineHeight.relaxed,
        }}
      >
        {tool.description}
      </Text>

      {/* Tool Capabilities */}
      {tool.capabilities && tool.capabilities.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: theme.spacing[2],
            marginTop: theme.spacing[2],
          }}
        >
          {tool.capabilities.map((capability, idx) => (
            <Badge
              key={idx}
              variant="outline"
              color="secondary"
              pill
              style={{
                fontSize: theme.typography.fontSize.xs,
              }}
            >
              {capability}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
