import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <label className="block w-full">
        <span className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1 block">
          {label}
        </span>
        <input
          ref={ref}
          className={`
            w-full rounded-xl border-gray-100 shadow-sm p-4 bg-gray-50 
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none
            transition-all placeholder:text-gray-300
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-red-500 text-[10px] font-bold uppercase mt-1 block animate-shake">
            {error}
          </span>
        )}
      </label>
    )
  }
)

Input.displayName = 'Input'
