"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronUp, X } from "lucide-react"

type DateMonthYearFilterProps = {
  value: string // Format: "YYYY-MM-DD"
  onChange: (value: string) => void
  className?: string
}

export function DateMonthYearFilter({
  value,
  onChange,
  className = ""
}: DateMonthYearFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<string>(value || "")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    onChange(newDate)
    setIsOpen(false)
  }

  const clearFilter = () => {
    setSelectedDate("")
    onChange("")
    setIsOpen(false)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="flex cursor-pointer text-sm hover:bg-gray-100 rounded border h-8"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className={`w-full hover:bg-gray-100 px-2 rounded ${!selectedDate ? "text-gray-400":""}`}
        />

        {selectedDate && (
          <X
            size={16}
            onClick={(e) => {
              e.stopPropagation()
              clearFilter()
            }}
            className="text-red-500 hover:text-gray-700"
          />
        )}
      </div>
    </div>
  )
}
