// components/DateRangeFilter.tsx
"use client"
import { Calendar, ChevronDown, ChevronUp, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

type DateFilterProps = {
  value: string // Format "YYYY-MM" atau ""
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const DateRangeFilter = ({
  value,
  onChange,
  placeholder = "Select month",
  className = ""
}: DateFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentYear = new Date().getFullYear()

  // Generate options untuk 2 tahun terakhir dan tahun depan
  const generateOptions = ():{ value: string; label: string }[] => {
    const options: { value: string; label: string }[] = []
    const years = [currentYear - 1, currentYear, currentYear + 1]
    
    years.forEach(year => {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0')
        const dateValue = `${year}-${monthStr}`
        const dateLabel = new Date(`${dateValue}-01`).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })
        
        options.push({
          value: dateValue,
          label: dateLabel
        })
      }
    })
    
    return options
  }

  const options = generateOptions()

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  const clearFilter = () => {
    onChange("")
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
        className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={16} />
        <span className="whitespace-nowrap">
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
            className="text-gray-500 hover:text-gray-700"
          />
        ) : isOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </div>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 max-h-60 overflow-auto">
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={`block px-4 py-2 text-sm cursor-pointer ${
                  value === option.value
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}