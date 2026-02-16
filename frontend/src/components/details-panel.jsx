import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/context/ThemeContext"

/**
 * DetailsPanel - Centralized component for displaying details with tabs
 * Handles all styling, theming, and layout
 */
export function DetailsPanel({ activeTab, onTabChange, tabs }) {
  const theme = useTheme()

  return (
    <div
      style={{
        width: "300px",
        padding: theme.spacing[4],
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.card,
        gap: theme.spacing[4],
      }}
    >
      {/* Details Header */}
      <h3
        style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: "700",
          color: theme.colors.foreground,
          textTransform: "uppercase",
          letterSpacing: "0.75px",
        }}
      >
        Details
      </h3>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={onTabChange} style={{ flex: 1, display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
        <TabsList
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
            width: "100%",
            backgroundColor: theme.colors.muted,
            borderRadius: "0.375rem",
            padding: "0.25rem",
            height: "auto",
            gap: "0.25rem",
          }}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              style={{
                fontSize: theme.typography.fontSize.xs,
                padding: "0.375rem 0.5rem",
                borderRadius: "0.25rem",
                fontWeight: "500",
                backgroundColor: activeTab === tab.id ? theme.colors.primary.DEFAULT : "transparent",
                color: activeTab === tab.id ? theme.colors.primaryForeground : theme.colors.foreground,
                border: "none",
                cursor: "pointer",
                transition: theme.transitions.normal,
              }}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Contents */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: theme.spacing[2], margin: 0 }}>
            {tab.type === "chips" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing[2] }}>
                {tab.items.map((item) => (
                  <Badge
                    key={item}
                    style={{
                      backgroundColor: theme.colors.primary.DEFAULT,
                      color: theme.colors.primaryForeground,
                      fontSize: theme.typography.fontSize.xs,
                      padding: "0.375rem 0.75rem",
                      fontWeight: "500",
                      border: "none",
                    }}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            ) : tab.type === "info" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
                {tab.items.map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: theme.colors.muted, borderRadius: theme.borderRadius.md, padding: theme.spacing[4] }}>
                    <label style={{ fontSize: theme.typography.fontSize.xs, fontWeight: "600", color: theme.colors.muted_foreground, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {item.label}
                    </label>
                    <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.foreground, margin: `${theme.spacing[1]} 0 0 0`, fontWeight: "500" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
