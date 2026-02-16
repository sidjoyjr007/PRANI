/**
 * Table Component with theme integration
 * Data table display with multiple variants and layouts
 * Variants: simple, striped, bordered, card
 * Sizes: sm, md, lg
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const Table = React.forwardRef(({ 
  className = "", 
  variant = "simple",
  size = "md",
  striped = false,
  bordered = false,
  hoverable = true,
  ...props 
}, ref) => {
  const theme = useTheme()

  let tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: size === "sm" ? "13px" : size === "md" ? "14px" : "15px",
  }

  let wrapperStyles = {
    overflowX: "auto",
    borderRadius: variant === "card" ? "8px" : "0px",
    border: bordered ? `2px solid ${theme.colors.neutral[200]}` : "none",
  }

  return (
    <div style={wrapperStyles} className={className}>
      <table
        ref={ref}
        style={tableStyles}
        {...props}
      />
    </div>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ 
  className = "",
  variant = "simple",
  ...props 
}, ref) => {
  const theme = useTheme()

  let headerStyles = {
    backgroundColor: theme.colors.neutral[100],
    borderBottom: `2px solid ${theme.colors.neutral[200]}`,
  }

  return (
    <thead 
      ref={ref} 
      style={headerStyles}
      className={className}
      {...props}
    />
  )
})
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ 
  className = "",
  striped = false,
  ...props 
}, ref) => (
  <tbody 
    ref={ref} 
    className={className}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ 
  className = "",
  ...props 
}, ref) => {
  const theme = useTheme()

  let footerStyles = {
    backgroundColor: theme.colors.neutral[100],
    borderTop: `2px solid ${theme.colors.neutral[200]}`,
    fontWeight: "600",
  }

  return (
    <tfoot
      ref={ref}
      style={footerStyles}
      className={className}
      {...props}
    />
  )
})
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ 
  className = "",
  variant = "simple",
  striped = false,
  hoverable = true,
  isStriped = false,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  let rowStyles = {
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    backgroundColor: isStriped ? theme.colors.neutral[50] : theme.colors.card,
    transition: "all 250ms ease",
  }

  if (isHovered && hoverable) {
    rowStyles.backgroundColor = theme.colors.neutral[100]
  }

  return (
    <tr
      ref={ref}
      style={rowStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  )
})
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ 
  className = "",
  sortable = false,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  let headStyles = {
    color: theme.colors.foreground,
    fontWeight: "600",
    padding: "12px 16px",
    textAlign: "left",
    verticalAlign: "middle",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backgroundColor: theme.colors.neutral[100],
    cursor: sortable ? "pointer" : "default",
    userSelect: "none",
    transition: "all 250ms ease",
  }

  if (isHovered && sortable) {
    headStyles.backgroundColor = theme.colors.neutral[200]
    headStyles.color = theme.colors.primary[600]
  }

  return (
    <th
      ref={ref}
      style={headStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  )
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ 
  className = "",
  size = "md",
  variant = "default",
  ...props 
}, ref) => {
  const theme = useTheme()

  const sizeMap = {
    sm: { padding: "8px 12px" },
    md: { padding: "12px 16px" },
    lg: { padding: "16px 20px" }
  }

  let cellStyles = {
    ...sizeMap[size],
    verticalAlign: "middle",
    color: theme.colors.foreground,
  }

  if (variant === "subtle") {
    cellStyles.color = theme.colors.muted_foreground
  }

  return (
    <td
      ref={ref}
      style={cellStyles}
      className={className}
      {...props}
    />
  )
})
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ 
  className = "",
  ...props 
}, ref) => {
  const theme = useTheme()

  let captionStyles = {
    marginTop: "12px",
    fontSize: "13px",
    color: theme.colors.muted_foreground,
  }

  return (
    <caption
      ref={ref}
      style={captionStyles}
      className={className}
      {...props}
    />
  )
})
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
