import { useTheme } from "@/context/ThemeContext"

/**
 * Card Grid Component
 * Reusable grid layout for displaying card-based content
 */
export default function CardGrid({ items, renderCard, columns = 3, gap = 8 }) {
  const theme = useTheme()

  const gridTemplateColumns = columns === "auto" 
    ? "repeat(auto-fill, minmax(300px, 1fr))"
    : `repeat(${columns}, 1fr)`

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: gridTemplateColumns,
      gap: theme.spacing[gap],
    }}>
      {items.map((item, index) => (
        <div key={item.id || index}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  )
}
