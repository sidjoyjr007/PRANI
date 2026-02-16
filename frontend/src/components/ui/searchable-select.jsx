import * as React from "react"
import { Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

export const SearchableSelect = React.forwardRef(({
  value,
  onValueChange,
  placeholder = "Search...",
  items = [],
  triggerStyle = {},
  contentStyle = {},
}, ref) => {
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const contentRef = React.useRef(null)
  const triggerRef = React.useRef(null)

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedItem = items.find(item => item.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <div style={{ position: "relative", width: "100%" }} ref={ref}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
          border: "none",
          backgroundColor: "transparent",
          color: "inherit",
          cursor: "pointer",
          fontSize: theme.typography.fontSize.sm,
          gap: theme.spacing[2],
          ...triggerStyle,
        }}
      >
        <span>{selectedItem?.label || "Select Agent"}</span>
        <ChevronDown size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: 0,
            marginBottom: theme.spacing[2],
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
            boxShadow: theme.shadows.md,
            zIndex: 50,
            maxHeight: theme.sizes.maxHeight.dropdown,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minWidth: theme.sizes.minWidth.dropdown,
            ...contentStyle,
          }}
        >
          {/* Search Input */}
          <div style={{ padding: theme.spacing[1] }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing[1],
                padding: theme.spacing[1],
                backgroundColor: theme.colors.input,
                borderRadius: theme.borderRadius.base,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <Search size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  backgroundColor: "transparent",
                  outline: "none",
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.foreground,
                  padding: `${theme.spacing[1]} 0`,
                }}
              />
            </div>
          </div>

          {/* Items List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onValueChange(item.value)
                    setOpen(false)
                    setSearch("")
                  }}
                  style={{
                    width: "100%",
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    border: "none",
                    backgroundColor: value === item.value ? theme.colors.primary.DEFAULT : "transparent",
                    color: value === item.value ? theme.colors.primaryForeground : theme.colors.foreground,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: theme.typography.fontSize.sm,
                    transition: theme.transitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    if (value !== item.value) {
                      e.target.style.backgroundColor = theme.colors.muted
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== item.value) {
                      e.target.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  {item.label}
                </button>
              ))
            ) : (
              <div style={{
                padding: theme.spacing[3],
                textAlign: "center",
                color: theme.colors.muted_foreground,
                fontSize: theme.typography.fontSize.xs,
              }}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

SearchableSelect.displayName = "SearchableSelect"
