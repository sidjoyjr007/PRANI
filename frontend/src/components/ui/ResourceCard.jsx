/**
 * ResourceCard Component
 * A premium, unified card for displaying system resources (Agents, LLMs, Tools, MCP Servers).
 * Features: Icons, status badges, secondary info, statistical footer, and floating hover actions.
 */

import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ResourceCard({
  title,
  subtitle,
  description,
  icon: Icon,
  badges = [], // { label, variant, color, icon: Icon }
  stats = [], // { label, value }
  actions = [], // { icon: Icon, onClick, title, variant, color }
  onClick,
  className,
  style,
  ...props
}) {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  // Core accent color from theme - sticking to the primary for "premium" feel
  const activeAccent = theme.colors.primary[500]

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        padding: 0,
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("group", className)}
      {...props}
    >
      {/* Dynamic Glow Effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(1200px circle at ${isHovered ? "50% 50%" : "50% -50%"}, ${activeAccent}08, transparent)`,
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
        zIndex: -1,
        borderRadius: "inherit"
      }} />

      {/* Floating Action Bar */}
      <div
        style={{
          position: "absolute",
          top: theme.spacing[4],
          right: theme.spacing[4],
          display: "flex",
          gap: theme.spacing[1.5],
          zIndex: 20,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(-4px)",
          transition: "all 0.2s ease-out",
        }}
      >
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant={action.variant || "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              action.onClick(e)
            }}
            style={{
              width: "32px",
              height: "32px",
              padding: 0,
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              border: `1px solid rgba(0,0,0,0.06)`,
              color: action.color || theme.colors.foreground,
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              ...action.style
            }}
            title={action.title}
          >
            {action.icon && <action.icon size={16} />}
          </Button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ padding: theme.spacing[6], flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header Section */}
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[5], marginBottom: theme.spacing[4] }}>
          {Icon && (
            <div style={{
              flexShrink: 0,
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isHovered 
                ? `linear-gradient(135deg, ${activeAccent}12 0%, ${activeAccent}04 100%)`
                : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${isHovered ? `${activeAccent}25` : "rgba(0,0,0,0.04)"}`,
              color: isHovered ? activeAccent : theme.colors.neutral[400],
              transition: "all 0.3s ease",
            }}>
              <Icon size={26} />
            </div>
          )}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Text
              as="h3"
              style={{
                fontSize: "1.125rem",
                fontWeight: 750,
                margin: 0,
                color: theme.colors.foreground,
                letterSpacing: "-0.015em",
                lineHeight: 1.2
              }}
              title={title}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: "13px",
                  color: theme.colors.muted_foreground,
                  marginTop: "0px",
                  fontWeight: 500,
                  transition: "color 0.3s ease",
                  textTransform: "lowercase",
                  opacity: 0.8,
                  letterSpacing: "-0.01em"
                }}
              >
                {subtitle}
              </Text>
            )}
          </div>
        </div>

        {/* Badges Section - Tag style with background */}
        {badges.length > 0 && (
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "6px", 
            marginBottom: theme.spacing[4],
            alignItems: "center"
          }}>
            {badges.map((badge, idx) => (
              <Badge
                key={idx}
                variant={badge.variant || "subtle"}
                color={badge.color || "primary"}
                size="sm"
                style={{ 
                  borderRadius: "99px",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  padding: "4px 12px",
                  backgroundColor: "rgba(0, 0, 0, 0.035)", // Softer tag feel
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: theme.colors.foreground,
                  letterSpacing: "0.01em"
                }}
              >
                {badge.icon && <badge.icon size={12} style={{ opacity: 0.7 }} />}
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Description Section */}
        {description && (
          <Text
            as="p"
            variant="body"
            size="sm"
            style={{
              margin: 0,
              color: theme.colors.muted_foreground,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Text>
        )}
      </div>

      {/* Stats Footer - Refined Bottom Right Anchor */}
      {stats.length > 0 && (
        <div style={{
          padding: `0 ${theme.spacing[6]} ${theme.spacing[5]}`,
          backgroundColor: "transparent",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: theme.spacing[5],
          marginTop: "auto",
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "4px", // Tight gap for better grouping
            }}>
              {stat.icon && (
                <div style={{ display: "flex", alignItems: "center", color: activeAccent, opacity: 0.8 }}>
                  <stat.icon size={14} strokeWidth={2} />
                </div>
              )}
              <Text
                style={{
                  margin: 0,
                  color: theme.colors.muted_foreground,
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: 1
                }}
              >
                {stat.value}
              </Text>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
