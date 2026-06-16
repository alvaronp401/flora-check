import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  isLoading?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isLoading, className = '', ...props }, ref) => {
    return (
      <label className="block w-full">
        <span className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1 flex justify-between items-center">
          {label}
          {isLoading && (
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          )}
        </span>
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full border-2 rounded-xl shadow-sm p-4 bg-gray-50 
              focus:ring-4 focus:ring-[#1A0F0A]/5 focus:border-[#1A0F0A] outline-none
              transition-all placeholder:text-gray-300
              ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-red-500 text-[10px] font-bold uppercase mt-1 animate-shake">
            {error}
          </span>
        )}
      </label>
    )
  }
)

Input.displayName = 'Input'
