// components/MonthYearFilter.tsx
"use client"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

type MonthYearFilterProps = {
  value: string // Format "YYYY-MM" atau ""
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

export const MonthYearFilter = ({
  value,
  onChange,
  placeholder = "Select month & year",
  className = ""
}: MonthYearFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2) // 2 tahun sebelum dan sesudah tahun ini

  useEffect(() => {
    if (value) {
      const [year, month] = value.split('-')
      setSelectedYear(year)
      setSelectedMonth(month)
    } else {
      setSelectedYear("")
      setSelectedMonth("")
    }
  }, [value])

  const handleApply = () => {
    if (selectedMonth && selectedYear) {
      onChange(`${selectedYear}-${selectedMonth}`)
    } else {
      onChange("")
    }
    setIsOpen(false)
  }

  const clearFilter = () => {
    onChange("")
    setIsOpen(false)
  }

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
        <span className={`whitespace-nowrap ${!value ? "text-gray-400" : "" }`}>
          {value 
            ? new Date(`${value}-01`).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })
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
          <div className="grid grid-cols-2 gap-4">
            {/* Month Selection */}
            <div>
              <h3 className="font-medium text-sm mb-2">Month</h3>
              <div className="grid grid-cols-2 gap-1 overflow-auto">
                {months.map(month => (
                  <button
                    key={month.value}
                    className={`text-left px-2 py-1 text-sm rounded ${
                      selectedMonth === month.value
                        ? "bg-blue-100 text-blue-800"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedMonth(month.value)}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Selection */}
            <div>
              <h3 className="font-medium text-sm mb-2">Year</h3>
              <div className="grid grid-cols-1 gap-1 max-h-40 overflow-auto">
                {years.map(year => (
                  <button
                    key={year}
                    className={`text-left px-2 py-1 text-sm rounded ${
                      selectedYear === year.toString()
                        ? "bg-blue-100 text-blue-800"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedYear(year.toString())}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-3 pt-2 border-t">
            <button
              onClick={handleApply}
              disabled={!selectedMonth || !selectedYear}
              className={`text-sm px-3 py-1 rounded ${
                selectedMonth && selectedYear
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