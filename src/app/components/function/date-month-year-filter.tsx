"use client"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

type DateMonthYearFilterProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
]

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate()

export const DateMonthYearFilter = ({
  value,
  onChange,
  placeholder = "Select date",
  className = ""
}: DateMonthYearFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2)

  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-')
      setSelectedYear(year)
      setSelectedMonth(month)
      setSelectedDay(day)
    } else {
      setSelectedYear("")
      setSelectedMonth("")
      setSelectedDay("")
    }
  }, [value])

  const handleApply = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      onChange(`${selectedYear}-${selectedMonth}-${selectedDay}`)
    } else {
      onChange("")
    }
    setIsOpen(false)
  }

  const clearFilter = () => {
    onChange("")
    setIsOpen(false)
  }

  const daysInMonth = selectedYear && selectedMonth
    ? getDaysInMonth(Number(selectedYear), Number(selectedMonth))
    : 31

  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))

  useEffect(() => {
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
        className="flex items-center justify-between cursor-pointer text-sm hover:bg-gray-100 px-2 py-1 rounded border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`whitespace-nowrap ${!value ? "text-gray-400" : ""}`}>
          {value
            ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : placeholder}
        </span>
        {value ? (
          <X
            size={16}
            onClick={(e) => {
              e.stopPropagation()
              clearFilter()
            }}
            className="text-red-500 hover:text-gray-700"
          />
        ) : isOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 p-3">
          <div className="grid grid-cols-3 gap-4">
            {/* Day */}
            <div>
              <h3 className="font-medium text-sm mb-2">Day</h3>
              <div className="grid max-h-40 overflow-auto gap-1">
                {days.map(day => (
                  <button
                    key={day}
                    className={`text-left px-2 py-1 text-sm rounded ${selectedDay === day ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Month */}
            <div>
              <h3 className="font-medium text-sm mb-2">Month</h3>
              <div className="grid max-h-40 overflow-auto gap-1">
                {months.map(month => (
                  <button
                    key={month.value}
                    className={`text-left px-2 py-1 text-sm rounded ${selectedMonth === month.value ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedMonth(month.value)}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Year */}
            <div>
              <h3 className="font-medium text-sm mb-2">Year</h3>
              <div className="grid max-h-40 overflow-auto gap-1">
                {years.map(year => (
                  <button
                    key={year}
                    className={`text-left px-2 py-1 text-sm rounded ${selectedYear === year.toString() ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedYear(year.toString())}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-3 pt-2 border-t">
            <button
              onClick={handleApply}
              disabled={!selectedDay || !selectedMonth || !selectedYear}
              className={`text-sm px-3 py-1 rounded ${
                selectedDay && selectedMonth && selectedYear
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
