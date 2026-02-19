/**
 * Combobox Component
 * Beautiful combobox (searchable select) inspired by Tailwind UI, styled with purple theme
 * Features: searchable, filterable, avatars, status indicators, sizes, variants
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Search, X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

// Fuzzy search algorithm
const fuzzySearch = (query, text) => {
  const lowerQuery = query.toLowerCase().trim()
  const lowerText = text.toLowerCase()

  // If query is empty, match all
  if (!lowerQuery) return true

  let queryIdx = 0
  let textIdx = 0

  while (textIdx < lowerText.length && queryIdx < lowerQuery.length) {
    if (lowerQuery[queryIdx] === lowerText[textIdx]) {
      queryIdx++
    }
    textIdx++
  }

  // If we've matched all query characters, it's a match
  return queryIdx === lowerQuery.length
}

const ComboboxContext = React.createContext({
  isOpen: false,
  handleOpenChange: () => { },
  searchValue: "",
  setSearchValue: () => { },
  value: "",
  handleValueChange: () => { },
})

const Combobox = React.forwardRef(({
  className,
  value = "",
  onValueChange,
  children,
  variant = "default",
  size = "md",
  disabled = false,
  multiselect = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)
  const [searchValue, setSearchValue] = React.useState("")

  const handleOpenChange = (newOpen) => setIsOpen(newOpen)

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    if (!multiselect) {
      setIsOpen(false)
      setSearchValue("")
    }
  }

  // Close on escape
  React.useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        e.preventDefault()
        handleOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  return (
    <ComboboxContext.Provider value={{
      isOpen,
      handleOpenChange,
      searchValue,
      setSearchValue,
      value: selectedValue,
      handleValueChange,
      variant,
      size,
      disabled,
      multiselect,
    }}>
      <div ref={ref} style={{ position: "relative", width: "100%" }} className={className} {...props}>
        {children}
      </div>
    </ComboboxContext.Provider>
  )
})
Combobox.displayName = "Combobox"

const ComboboxTrigger = React.forwardRef(({
  className,
  size = "md",
  disabled = false,
  children,
  style,
  ...props
}, ref) => {
  const theme = useTheme()
  const { isOpen, handleOpenChange, value, variant } = React.useContext(ComboboxContext)
  const [isHovering, setIsHovering] = React.useState(false)

  const sizeStyles = {
    sm: { height: theme.spacing[8], paddingX: theme.spacing[3], fontSize: theme.typography.fontSize.sm },
    md: { height: theme.spacing[10], paddingX: theme.spacing[4], fontSize: theme.typography.fontSize.sm },
    lg: { height: theme.spacing[12], paddingX: theme.spacing[4], fontSize: theme.typography.fontSize.base },
  }

  const sizeConfig = sizeStyles[size] || sizeStyles.md

  // Variant styles
  const variantStyles = {
    default: {
      bgColor: disabled ? theme.colors.neutral[50] : theme.colors.card,
      borderColor: isOpen ? theme.colors.primary[500] : isHovering && !disabled ? theme.colors.neutral[400] : theme.colors.neutral[300],
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `0 0 0 3px ${theme.colors.primary[100]}` : "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    outline: {
      bgColor: "transparent",
      borderColor: isOpen ? theme.colors.primary[500] : isHovering && !disabled ? theme.colors.neutral[400] : theme.colors.neutral[300],
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
    },
    minimal: {
      bgColor: "transparent",
      borderColor: "transparent",
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `inset 0 -2px 0 ${theme.colors.primary[500]}` : `inset 0 -1px 0 ${theme.colors.neutral[300]}`,
    },
    filled: {
      bgColor: disabled ? theme.colors.neutral[50] : theme.colors.neutral[100],
      borderColor: "transparent",
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
    },
    ghost: {
      bgColor: isHovering && !disabled ? theme.colors.neutral[100] : "transparent",
      borderColor: "transparent",
      textColor: theme.colors.foreground,
      boxShadow: "none",
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.default

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && handleOpenChange(!isOpen)}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: sizeConfig.height,
        paddingLeft: sizeConfig.paddingX,
        paddingRight: sizeConfig.paddingX,
        fontSize: sizeConfig.fontSize,
        fontWeight: theme.typography.fontWeight.normal,
        backgroundColor: currentVariant.bgColor,
        color: currentVariant.textColor,
        border: variant === "minimal" ? "none" : `${theme.borderWidth.sm} solid ${currentVariant.borderColor}`,
        borderRadius: variant === "minimal" ? "0" : theme.borderRadius.md,
        transition: theme.transitions.fast,
        opacity: disabled ? theme.opacity.disabled : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: currentVariant.boxShadow,
        ...style,
      }}
      className={cn(className)}
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <span style={{ color: value ? theme.colors.foreground : theme.colors.neutral[500] }}>
        {children}
      </span>
      <ChevronDown
        size={18}
        style={{
          transition: `transform ${theme.transitions.fast}`,
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          flexShrink: 0,
          marginLeft: theme.spacing[2],
          color: theme.colors.neutral[400]
        }}
      />
    </button>
  )
})
ComboboxTrigger.displayName = "ComboboxTrigger"

const ComboboxContent = React.forwardRef(({ className, maxHeight = "320px", children, ...props }, ref) => {
  const theme = useTheme()
  const { isOpen, handleOpenChange, searchValue, setSearchValue } = React.useContext(ComboboxContext)

  if (!isOpen) return null

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
        }}
        onClick={() => handleOpenChange(false)}
      />
      <div
        ref={ref}
        style={{
          position: "absolute",
          bottom: "calc(100% + 4px)",
          left: 0,
          minWidth: "200px",
          maxHeight: maxHeight,
          borderRadius: theme.borderRadius.md,
          border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.card,
          boxShadow: theme.shadows.lg,
          zIndex: 50,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    </>
  )
})
ComboboxContent.displayName = "ComboboxContent"

const ComboboxSearch = React.forwardRef(({ className, placeholder = "Search...", ...props }, ref) => {
  const theme = useTheme()
  const { searchValue, setSearchValue } = React.useContext(ComboboxContext)
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: theme.spacing[2],
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
      backgroundColor: theme.colors.card,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Search size={16} style={{ color: theme.colors.neutral[400] }} />
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value)
        }}
        onKeyDown={(e) => {
          // Don't prevent any keys - let them all through
          e.stopPropagation()
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        style={{
          flex: 1,
          border: "none",
          backgroundColor: "transparent",
          outline: "none",
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.foreground,
        }}
        className={cn(className)}
        {...props}
      />
      {searchValue && (
        <button
          type="button"
          onClick={() => setSearchValue("")}
          style={{
            cursor: "pointer",
            color: theme.colors.neutral[400],
            padding: theme.spacing[1],
            background: "none",
            border: "none",
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
})
ComboboxSearch.displayName = "ComboboxSearch"

const ComboboxItem = React.forwardRef(({
  value,
  disabled = false,
  className,
  children,
  avatar,
  status,
  description,
  leadingIcon: LeadingIcon,
  searchableText,
  ...props
}, ref) => {
  const theme = useTheme()
  const { value: selectedValue, handleValueChange, searchValue, multiselect } = React.useContext(ComboboxContext)
  const isSelected = selectedValue === value
  const [isHovering, setIsHovering] = React.useState(false)

  // Filter logic - hide items that don't match search
  // Use searchableText prop if provided, otherwise extract from children
  const textToSearch = searchableText || React.Children.toArray(children)
    .map(child => {
      if (typeof child === 'string') return child
      if (typeof child === 'object' && child?.props?.children) {
        return React.Children.toArray(child.props.children)
          .map(c => typeof c === 'string' ? c : '')
          .join(' ')
      }
      return ''
    })
    .join(' ')

  const isVisible = fuzzySearch(searchValue, textToSearch)

  if (!isVisible) return null

  const statusColors = {
    online: theme.colors.success[500],
    away: theme.colors.warning[500],
    offline: theme.colors.neutral[500],
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && handleValueChange(value)}
      style={{
        display: "flex",
        width: "100%",
        textAlign: "left",
        alignItems: "center",
        gap: theme.spacing[3],
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.normal,
        backgroundColor: isSelected ? theme.colors.primary[50] : isHovering && !disabled ? theme.colors.neutral[50] : "transparent",
        color: isSelected ? theme.colors.primary[700] : theme.colors.foreground,
        border: "none",
        transition: `background-color ${theme.transitions.fast}`,
        opacity: disabled ? theme.opacity.disabled : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      className={cn(className)}
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {avatar && (
        <div style={{
          width: theme.spacing[8],
          height: theme.spacing[8],
          borderRadius: "50%",
          backgroundImage: `url(${avatar})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
          position: "relative",
          border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
        }}>
          {status && (
            <div style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: theme.spacing[2.5],
              height: theme.spacing[2.5],
              borderRadius: "50%",
              backgroundColor: statusColors[status] || statusColors.offline,
              border: `2px solid ${theme.colors.card}`,
            }} />
          )}
        </div>
      )}

      {LeadingIcon && !avatar && (
        <LeadingIcon size={16} style={{ flexShrink: 0 }} />
      )}

      <div style={{ flex: 1 }}>
        <div>{children}</div>
        {description && (
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: isSelected ? theme.colors.primary[500] : theme.colors.neutral[500],
            marginTop: "4px",
          }}>
            {description}
          </div>
        )}
      </div>

      {!multiselect && isSelected && (
        <div style={{
          width: "20px",
          height: "20px",
          borderRadius: "4px",
          backgroundColor: theme.colors.primary[500],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6L5 9L10 3" stroke={theme.colors.card} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  )
})
ComboboxItem.displayName = "ComboboxItem"

const ComboboxValue = ({ placeholder = "Select..." }) => {
  const { value } = React.useContext(ComboboxContext)
  return value || placeholder
}
ComboboxValue.displayName = "ComboboxValue"

const ComboboxEmpty = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        padding: "16px",
        textAlign: "center",
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.neutral[500],
      }}
      className={cn(className)}
      {...props}
    />
  )
})
ComboboxEmpty.displayName = "ComboboxEmpty"

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxSearch,
  ComboboxValue,
  ComboboxItem,
  ComboboxEmpty,
}
