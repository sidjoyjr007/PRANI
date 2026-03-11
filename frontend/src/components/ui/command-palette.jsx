import React, { useState, useMemo, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogPortal, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Check } from "lucide-react"

export function CommandPalette({
    isOpen,
    onClose,
    title = "Select items",
    description,
    placeholder = "Search...",
    items = [],
    selectedIds = [],
    onSelect,
    onDeselect,
    emptyMessage = "No items found."
}) {
    const theme = useTheme()
    const [searchQuery, setSearchQuery] = useState("")
    const [hoveredId, setHoveredId] = useState(null)

    // Reset search on open
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("")
            setHoveredId(null)
        }
    }, [isOpen])

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items

        return items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    }, [items, searchQuery])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPortal>
                <DialogContent
                    size="lg"
                    style={{
                        padding: 0,
                        overflow: "hidden",
                        top: "15%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        borderRadius: theme.borderRadius.xl,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                        border: `1px solid ${theme.colors.neutral[200]}`,
                        maxWidth: "640px",
                        width: "90vw"
                    }}
                >
                    {/* Header and Search */}
                    <div style={{ padding: theme.spacing[4], borderBottom: `1px solid ${theme.colors.neutral[100]}`, position: 'relative' }}>
                        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[3] }}>
                            <Search size={20} style={{ color: theme.colors.muted_foreground }} />
                            <input
                                autoFocus
                                placeholder={placeholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    fontSize: theme.typography.fontSize.lg,
                                    border: "none",
                                    outline: "none",
                                    boxShadow: "none",
                                    padding: 0,
                                    color: theme.colors.foreground,
                                    backgroundColor: "transparent",
                                    flex: 1
                                }}
                            />
                            <DialogClose style={{ flexShrink: 0 }} />
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div style={{
                        maxHeight: "350px",
                        overflowY: "auto",
                        padding: theme.spacing[3],
                    }}>
                        {filteredItems.length === 0 ? (
                            <div style={{
                                padding: theme.spacing[12],
                                textAlign: "center",
                                color: theme.colors.muted_foreground,
                                fontSize: theme.typography.fontSize.sm
                            }}>
                                {emptyMessage}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {filteredItems.map(item => {
                                    const isSelected = selectedIds.includes(item.id)

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => isSelected ? onDeselect(item.id) : onSelect(item.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                                                borderRadius: theme.borderRadius.lg,
                                                cursor: "pointer",
                                                backgroundColor: "transparent",
                                            }}
                                        >
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <span style={{
                                                    fontSize: theme.typography.fontSize.base,
                                                    fontWeight: theme.typography.fontWeight.medium,
                                                    color: isSelected ? theme.colors.primary[900] : theme.colors.neutral[800]
                                                }}>
                                                    {item.label}
                                                </span>
                                                {item.description && (
                                                    <span style={{
                                                        fontSize: theme.typography.fontSize.sm,
                                                        color: isSelected ? theme.colors.primary[700] : theme.colors.muted_foreground
                                                    }}>
                                                        {item.description}
                                                    </span>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <Check size={18} strokeWidth={2.5} style={{ color: theme.colors.primary[600] }} />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}
