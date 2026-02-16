/**
 * Pagination Component with theme integration
 * Page navigation with multiple layouts and variants
 * Variants: default, outline, minimal
 * Sizes: sm, md, lg
 * Layouts: default, centered, compact
 */

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const Pagination = React.forwardRef(({ 
  className = "", 
  variant = "default",
  size = "md",
  centered = false,
  ...props 
}, ref) => {
  const theme = useTheme()
  
  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      style={{
        display: "flex",
        justifyContent: centered ? "center" : "flex-start",
        alignItems: "center",
        gap: "8px",
      }}
      className={className}
      {...props}
    />
  )
})
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => (
  <ul
    ref={ref}
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "8px",
      listStyle: "none",
      padding: 0,
      margin: 0,
    }}
    className={className}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => (
  <li 
    ref={ref} 
    className={className} 
    {...props} 
  />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef(({ 
  className = "",
  isActive = false,
  disabled = false,
  size = "md",
  variant = "default",
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  const sizeMap = {
    sm: { height: "32px", width: "32px", fontSize: "13px", padding: "4px 8px" },
    md: { height: "40px", width: "40px", fontSize: "14px", padding: "8px 12px" },
    lg: { height: "48px", width: "48px", fontSize: "16px", padding: "12px 16px" }
  }

  const sizeStyle = sizeMap[size]

  let linkStyles = {}

  if (variant === "default") {
    linkStyles = {
      height: sizeStyle.height,
      minWidth: sizeStyle.width,
      padding: sizeStyle.padding,
      fontSize: sizeStyle.fontSize,
      fontWeight: isActive ? "600" : "500",
      color: isActive ? theme.colors.white : theme.colors.foreground,
      backgroundColor: isActive ? theme.colors.primary[600] : theme.colors.card,
      border: `2px solid ${isActive ? theme.colors.primary[600] : theme.colors.neutral[200]}`,
      borderRadius: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 250ms ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.5 : 1,
    }
    if (isHovered && !disabled && !isActive) {
      linkStyles.backgroundColor = theme.colors.neutral[100]
      linkStyles.color = theme.colors.primary[600]
      linkStyles.borderColor = theme.colors.primary[300]
      linkStyles.boxShadow = `0 0 0 3px ${theme.colors.primary[100]}`
    }
  } else if (variant === "outline") {
    linkStyles = {
      height: sizeStyle.height,
      minWidth: sizeStyle.width,
      padding: sizeStyle.padding,
      fontSize: sizeStyle.fontSize,
      fontWeight: isActive ? "600" : "500",
      color: isActive ? theme.colors.white : theme.colors.foreground,
      backgroundColor: isActive ? theme.colors.primary[600] : "transparent",
      border: `2px solid ${isActive ? theme.colors.primary[600] : theme.colors.neutral[300]}`,
      borderRadius: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 250ms ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.5 : 1,
    }
    if (isHovered && !disabled && !isActive) {
      linkStyles.borderColor = theme.colors.primary[400]
      linkStyles.color = theme.colors.primary[600]
    }
  } else if (variant === "minimal") {
    linkStyles = {
      height: sizeStyle.height,
      minWidth: sizeStyle.width,
      padding: sizeStyle.padding,
      fontSize: sizeStyle.fontSize,
      fontWeight: isActive ? "600" : "500",
      color: isActive ? theme.colors.primary[600] : theme.colors.neutral[600],
      backgroundColor: "transparent",
      border: "none",
      borderBottom: isActive ? `3px solid ${theme.colors.primary[600]}` : "3px solid transparent",
      borderRadius: "0px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 250ms ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.5 : 1,
    }
    if (isHovered && !disabled && !isActive) {
      linkStyles.color = theme.colors.foreground
      linkStyles.borderBottomColor = theme.colors.neutral[300]
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      style={linkStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  )
})
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef(({ 
  className = "", 
  disabled = false,
  size = "md",
  variant = "default",
  showLabel = true,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  const sizeMap = {
    sm: { height: "32px", padding: "4px 12px", fontSize: "13px", iconSize: 16 },
    md: { height: "40px", padding: "8px 16px", fontSize: "14px", iconSize: 18 },
    lg: { height: "48px", padding: "12px 20px", fontSize: "16px", iconSize: 20 }
  }

  const sizeStyle = sizeMap[size]

  let styles = {
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontWeight: "500",
    color: disabled ? theme.colors.neutral[400] : theme.colors.foreground,
    backgroundColor: isHovered && !disabled ? theme.colors.neutral[100] : theme.colors.card,
    border: `2px solid ${isHovered && !disabled ? theme.colors.primary[300] : theme.colors.neutral[200]}`,
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 250ms ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
  }

  if (isHovered && !disabled) {
    styles.color = theme.colors.primary[600]
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      style={styles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <ChevronLeft size={sizeStyle.iconSize} />
      {showLabel && <span>Previous</span>}
    </button>
  )
})
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef(({ 
  className = "", 
  disabled = false,
  size = "md",
  variant = "default",
  showLabel = true,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  const sizeMap = {
    sm: { height: "32px", padding: "4px 12px", fontSize: "13px", iconSize: 16 },
    md: { height: "40px", padding: "8px 16px", fontSize: "14px", iconSize: 18 },
    lg: { height: "48px", padding: "12px 20px", fontSize: "16px", iconSize: 20 }
  }

  const sizeStyle = sizeMap[size]

  let styles = {
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontWeight: "500",
    color: disabled ? theme.colors.neutral[400] : theme.colors.foreground,
    backgroundColor: isHovered && !disabled ? theme.colors.neutral[100] : theme.colors.card,
    border: `2px solid ${isHovered && !disabled ? theme.colors.primary[300] : theme.colors.neutral[200]}`,
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 250ms ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
  }

  if (isHovered && !disabled) {
    styles.color = theme.colors.primary[600]
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      style={styles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {showLabel && <span>Next</span>}
      <ChevronRight size={sizeStyle.iconSize} />
    </button>
  )
})
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className = "", ...props }) => {
  const theme = useTheme()
  return (
    <span 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "40px",
        width: "40px",
        color: theme.colors.neutral[500],
        fontSize: "18px",
        fontWeight: "600",
      }}
      className={className}
      {...props}
    >
      ⋯
    </span>
  )
}
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
