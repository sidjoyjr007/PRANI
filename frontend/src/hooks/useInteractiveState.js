import { useState } from "react"

/**
 * Custom hook for managing interactive component states
 * Returns state object and handlers - components apply states from theme
 */
export function useInteractiveState() {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  const [focused, setFocused] = useState(false)

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }

  const state = { hovered, active, focused }

  return { state, handlers }
}

/**
 * Utility to merge state-based styles from theme
 * component applies appropriate styles based on state
 */
export function getStateStyles(baseStyles, stateConfig, componentState, isDisabled = false) {
  let mergedStyles = { ...baseStyles }

  if (isDisabled && stateConfig.disabled) {
    mergedStyles = { ...mergedStyles, ...stateConfig.disabled }
  } else {
    if (componentState.hovered && stateConfig.hover) {
      mergedStyles = { ...mergedStyles, ...stateConfig.hover }
    }
    if (componentState.active && stateConfig.active) {
      mergedStyles = { ...mergedStyles, ...stateConfig.active }
    }
    if (componentState.focused && stateConfig.focus) {
      mergedStyles = { ...mergedStyles, ...stateConfig.focus }
    }
  }

  return mergedStyles
}
