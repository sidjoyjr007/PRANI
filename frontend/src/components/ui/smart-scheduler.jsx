import * as React from "react"
import { useTheme } from "@/context/ThemeContext"
import { Clock, Calendar } from "lucide-react"
import { Input } from "./input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select"
import { Text } from "./text"
import { getHumanReadableCron } from "@/utils/cron"

const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
]

export function SmartScheduler({ onChange, initialValue }) {
  const theme = useTheme()
  const [mode, setMode] = React.useState("INTERVAL")
  const [time, setTime] = React.useState("12:00")
  const [selectedDays, setSelectedDays] = React.useState([1]) // Monday
  const [dayOfMonth, setDayOfMonth] = React.useState(1)
  const [intervalValue, setIntervalValue] = React.useState(15)
  const [intervalUnit, setIntervalUnit] = React.useState("SECONDS")
  const [customCron, setCustomCron] = React.useState("*/15 * * * * *")
  const [currentCron, setCurrentCron] = React.useState("")
  const [isHydrating, setIsHydrating] = React.useState(!!initialValue)
  const lastInitialValueRef = React.useRef(null)

  // Hydrate from initialValue once
  React.useEffect(() => {
    if (!initialValue || initialValue === currentCron || initialValue === lastInitialValueRef.current) {
      if (!initialValue) setIsHydrating(false)
      return
    }

    lastInitialValueRef.current = initialValue
    setIsHydrating(true)

    try {
      const parts = initialValue.trim().split(/\s+/)
      
      // Detection logic
      if (initialValue.includes("*/")) {
        setMode("INTERVAL")
        if (parts.length === 6) { // Seconds included
          if (parts[0].startsWith("*/")) {
            setIntervalValue(parseInt(parts[0].replace("*/", "")))
            setIntervalUnit("SECONDS")
          } else if (parts[1].startsWith("*/")) {
            setIntervalValue(parseInt(parts[1].replace("*/", "")))
            setIntervalUnit("MINUTES")
          } else if (parts[2].startsWith("*/")) {
            setIntervalValue(parseInt(parts[2].replace("*/", "")))
            setIntervalUnit("HOURS")
          }
        } else { // Standard 5 parts
          if (parts[0].startsWith("*/")) {
            setIntervalValue(parseInt(parts[0].replace("*/", "")))
            setIntervalUnit("MINUTES")
          } else if (parts[1].startsWith("*/")) {
            setIntervalValue(parseInt(parts[1].replace("*/", "")))
            setIntervalUnit("HOURS")
          }
        }
      } 
      // WEEKLY (check if day of week is not *)
      else if (parts.length >= 5 && parts[parts.length-1] !== "*" && parts[parts.length-1] !== "?") {
        setMode("WEEKLY")
        const days = parts[parts.length-1].split(",").map(d => parseInt(d))
        setSelectedDays(days)
        const minIdx = parts.length === 6 ? 1 : 0
        const hourIdx = parts.length === 6 ? 2 : 1
        setTime(`${parts[hourIdx].padStart(2, '0')}:${parts[minIdx].padStart(2, '0')}`)
      }
      // MONTHLY (check if day of month is not *)
      else if (parts.length >= 5 && parts[parts.length-3] !== "*" && parts[parts.length-3] !== "?") {
        setMode("MONTHLY")
        setDayOfMonth(parseInt(parts[parts.length-3]))
        const minIdx = parts.length === 6 ? 1 : 0
        const hourIdx = parts.length === 6 ? 2 : 1
        setTime(`${parts[hourIdx].padStart(2, '0')}:${parts[minIdx].padStart(2, '0')}`)
      }
      // DAILY
      else if (parts.length >= 5) {
        setMode("DAILY")
        const minIdx = parts.length === 6 ? 1 : 0
        const hourIdx = parts.length === 6 ? 2 : 1
        setTime(`${parts[hourIdx].padStart(2, '0')}:${parts[minIdx].padStart(2, '0')}`)
      }
      else {
        setMode("CUSTOM")
        setCustomCron(initialValue)
      }
    } catch (e) {
      console.warn("SmartScheduler: Failed to parse initialValue", initialValue, e)
      setMode("CUSTOM")
      setCustomCron(initialValue)
    } finally {
      setIsHydrating(false)
    }
  }, [initialValue])

  // Generate cron whenever state changes
  React.useEffect(() => {
    if (isHydrating) return

    let cron = ""
    const [h, m] = time.split(":").map(s => parseInt(s).toString())

    if (mode === "INTERVAL") {
      if (intervalUnit === "SECONDS") {
        cron = `*/${intervalValue} * * * * *`
      } else if (intervalUnit === "MINUTES") {
        cron = `0 */${intervalValue} * * * *`
      } else if (intervalUnit === "HOURS") {
        cron = `0 0 */${intervalValue} * * *`
      }
    } else if (mode === "DAILY") {
      cron = `0 ${m} ${h} * * *`
    } else if (mode === "WEEKLY") {
      const days = selectedDays.length > 0 ? selectedDays.join(",") : "*"
      cron = `0 ${m} ${h} * * ${days}`
    } else if (mode === "MONTHLY") {
      cron = `0 ${m} ${h} ${dayOfMonth} * *`
    } else {
      cron = customCron
    }

    if (cron && cron !== currentCron) {
      setCurrentCron(cron)
      // Only call onChange if it's actually a user change, 
      // or if it's the first stable cron after hydration that differs from initialValue
      if (cron !== initialValue) {
        onChange(cron)
      }
    }
  }, [mode, time, selectedDays, dayOfMonth, intervalValue, intervalUnit, customCron, isHydrating, onChange, currentCron, initialValue])

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Mode Selector */}
        <div className="space-y-2">
          <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: theme.colors.muted_foreground, letterSpacing: "0.05em" }}>
            Schedule Type
          </label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-full bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTERVAL">Recurring Interval</SelectItem>
              <SelectItem value="DAILY">Daily Time</SelectItem>
              <SelectItem value="WEEKLY">Weekly Days</SelectItem>
              <SelectItem value="MONTHLY">Monthly Date</SelectItem>
              <SelectItem value="CUSTOM">Custom Cron</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Controls */}
        {mode === "INTERVAL" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: theme.colors.muted_foreground, letterSpacing: "0.05em" }}>
              Frequency
            </label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                min={1}
                value={intervalValue} 
                onChange={(e) => setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 bg-background/50"
              />
              <Select value={intervalUnit} onValueChange={setIntervalUnit}>
                <SelectTrigger className="flex-1 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SECONDS">Seconds</SelectItem>
                  <SelectItem value="MINUTES">Minutes</SelectItem>
                  <SelectItem value="HOURS">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {(mode === "DAILY" || mode === "WEEKLY" || mode === "MONTHLY") && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: theme.colors.muted_foreground, letterSpacing: "0.05em" }}>
              Execution Time
            </label>
            <Input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              className="bg-background/50"
            />
          </div>
        )}

        {mode === "WEEKLY" && (
          <div className="col-span-full space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: theme.colors.muted_foreground, letterSpacing: "0.05em" }}>
              Days of Week
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  type="button"
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    backgroundColor: selectedDays.includes(day.value) ? theme.colors.primary[500] : theme.colors.background,
                    color: selectedDays.includes(day.value) ? "white" : theme.colors.foreground,
                    border: `1px solid ${selectedDays.includes(day.value) ? theme.colors.primary[500] : theme.colors.border}`,
                  }}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "MONTHLY" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: theme.colors.muted_foreground, letterSpacing: "0.05em" }}>
              Day of Month
            </label>
            <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(parseInt(v))}>
              <SelectTrigger className="w-full bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <SelectItem key={day} value={day.toString()}>Day {day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === "CUSTOM" && (
          <div className="col-span-full space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: theme.colors.muted_foreground, letterSpacing: "0.05em" }}>
              Cron Expression
            </label>
            <Input 
              value={customCron} 
              onChange={(e) => setCustomCron(e.target.value)} 
              placeholder="e.g. 0 0 * * * (Standard 5-part or 6-part cron)"
              className="font-mono bg-background/50"
            />
            <Text variant="small" style={{ color: theme.colors.muted_foreground }}>
              Format: [sec] [min] [hour] [day] [month] [dayOfWeek]
            </Text>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div style={{
        marginTop: theme.spacing[2],
        padding: theme.spacing[4],
        borderRadius: "12px",
        backgroundColor: "rgba(255,255,255,0.02)",
        border: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing[4],
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "10px",
          backgroundColor: theme.colors.primary[500] + "15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.primary[500],
          boxShadow: `0 0 20px ${theme.colors.primary[500]}10`
        }}>
          {mode === "INTERVAL" ? <Clock size={20} /> : <Calendar size={20} />}
        </div>
        <div className="flex-1">
          <Text style={{ fontWeight: "600", color: theme.colors.foreground, fontSize: "15px" }}>
            {getHumanReadableCron(currentCron)}
          </Text>
        </div>
        <div style={{
          fontSize: "11px",
          fontFamily: "monospace",
          backgroundColor: theme.colors.muted + "40",
          padding: "4px 8px",
          borderRadius: "6px",
          color: theme.colors.muted_foreground
        }}>
          {currentCron}
        </div>
      </div>
    </div>
  );
}
