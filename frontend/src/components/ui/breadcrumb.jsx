/**
 * Breadcrumb Component
 * Navigation path indicator with multiple variants and separators
 * Variants: default (chevron), slash, dot, arrow
 * Styles: contained, full-width, simple
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, Slash, Dot, ArrowRight } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const getSeparatorIcon = (separator) => {
  switch (separator) {
    case "slash":
      return Slash
    case "dot":
      return Dot
    case "arrow":
      return ArrowRight
    case "chevron":
    default:
      return ChevronRight
  }
}

const Breadcrumb = React.forwardRef(({ 
  className,
  variant = "simple",
  separator = "chevron",
  ...props 
}, ref) => {
  const theme = useTheme()
  
  const variantStyles = {
    contained: {
      backgroundColor: theme.colors.neutral[50],
      borderColor: theme.colors.neutral[200],
      borderWidth: "2px",
      borderStyle: "solid",
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      borderRadius: theme.borderRadius.lg,
    },
    fullWidth: {
      backgroundColor: theme.colors.neutral[100],
      borderColor: theme.colors.neutral[300],
      borderWidth: "0px",
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      borderRadius: "0px",
      width: "100%",
    },
    simple: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: "0px",
      padding: "0px",
      borderRadius: "0px",
    },
  }

  const style = variantStyles[variant] || variantStyles.simple

  return (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        transition: `all ${theme.transitions.normal}`,
      }}
      className={cn(className)}
      {...props}
    />
  )
})
Breadcrumb.displayName = "Breadcrumb"

Breadcrumb.separator = "chevron"
Breadcrumb.variant = "simple"

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <ol
      ref={ref}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.spacing[1],
      }}
      className={cn(className)}
      {...props}
    />
  )
})
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
    }}
    className={cn(className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef(({ 
  className, 
  active = false, 
  ...props 
}, ref) => {
  const theme = useTheme()
  return (
    <a
      ref={ref}
      style={{
        color: active ? theme.colors.neutral[900] : theme.colors.primary[600],
        textDecoration: active ? "none" : "none",
        transition: `color ${theme.transitions.normal}`,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
        cursor: active ? "default" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = theme.colors.primary[700]
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = theme.colors.primary[600]
      }}
      className={cn(className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = React.forwardRef(({ 
  children, 
  className,
  separator = "chevron",
  ...props 
}, ref) => {
  const theme = useTheme()
  const SeparatorIcon = children ? null : getSeparatorIcon(separator)

  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      style={{ 
        color: theme.colors.neutral[400],
        display: "flex",
        alignItems: "center",
      }}
      className={cn(className)}
      {...props}
    >
      {children ? (
        children
      ) : (
        <SeparatorIcon className="h-4 w-4" />
      )}
    </span>
  )
})
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <span
      ref={ref}
      role="doc-pagebreak"
      aria-current="page"
      aria-label="page"
      style={{
        color: theme.colors.neutral[900],
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
      }}
      className={cn(className)}
      {...props}
    />
  )
})
BreadcrumbPage.displayName = "BreadcrumbPage"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
}
