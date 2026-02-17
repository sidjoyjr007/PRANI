import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Chips } from "@/components/ui/chips"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

/**
 * CapabilitiesInput Component
 * Allows users to add and remove capability tags/chips
 * Displays as chips with remove buttons and an input field to add new ones
 */
export default function CapabilitiesInput({ value = [], onChange }) {
  const theme = useTheme()
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState("")

  const handleAddCapability = () => {
    const trimmed = inputValue.trim().toLowerCase()
    
    if (!trimmed) {
      setError("Please enter a capability")
      return
    }

    if (value.includes(trimmed)) {
      setError("This capability already exists")
      return
    }

    if (value.length >= 10) {
      setError("Maximum 10 capabilities allowed")
      return
    }

    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      setError("Only lowercase letters, numbers, and hyphens allowed")
      return
    }

    onChange([...value, trimmed])
    setInputValue("")
    setError("")
  }

  const handleRemoveCapability = (index) => {
    onChange(value.filter((_, i) => i !== index))
    setError("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddCapability()
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
      {/* Input Row */}
      <div style={{ display: "flex", gap: theme.spacing[3], alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Add a capability (e.g., search, analysis, code)"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError("")
            }}
            onKeyDown={handleKeyDown}
            error={!!error}
            helperText={error}
          />
        </div>
        <Button
          variant="outline"
          size="md"
          leadingIcon={Plus}
          onClick={handleAddCapability}
          style={{ marginTop: error ? theme.spacing[8] : 0 }}
        >
          Add
        </Button>
      </div>

      {/* Capabilities Display */}
      {value.length > 0 && (
        <div>
          <Chips
            items={value}
            variant="primary"
            size="md"
            onRemove={(index) => handleRemoveCapability(index)}
          />
        </div>
      )}

      {/* Hint */}
      <p
        style={{
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.muted_foreground,
          margin: 0,
        }}
      >
        You can add up to 10 capabilities. Use lowercase letters, numbers, and hyphens.
      </p>
    </div>
  )
}
