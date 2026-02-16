/**
 * Aspect Ratio Component with theme integration
 * Maintains aspect ratio container
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const AspectRatio = React.forwardRef(({ 
  className, 
  ratio = 16 / 9,
  ...props 
}, ref) => {
  const paddingBottom = (1 / ratio) * 100

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ paddingBottom: `${paddingBottom}%` }}
    >
      <div className="absolute inset-0">
        {props.children}
      </div>
    </div>
  )
})
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
