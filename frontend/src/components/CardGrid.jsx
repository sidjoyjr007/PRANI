import { useTheme } from "@/context/ThemeContext"

/**
 * Card Grid Component
 * Reusable grid layout for displaying card-based content
 */
export default function CardGrid({ items = [], renderCard, columns = 3, gap = 8 }) {
  const theme = useTheme()

  if (!items || items.length === 0) {
    return null
  }

  const gridTemplateColumns = columns === "auto"
    ? "repeat(auto-fill, minmax(300px, 1fr))"
    : columns === 3
      ? "repeat(auto-fill, minmax(300px, 1fr))"
      : `repeat(${columns}, 1fr)`

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: gridTemplateColumns,
      gap: theme.spacing[gap],
    }}>
      {items.map((item, index) => (
        // The inner div ensures the card fills the grid cell, allowing the card itself to take 100% height.
        // The actual card component (rendered by renderCard) should apply height: "100%" to its root element.
        <div key={item.id || index} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  )
}
