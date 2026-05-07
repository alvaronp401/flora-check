import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  isLoading?: boolean
  pulse?: boolean
  showShimmer?: boolean
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  pulse,
  showShimmer,
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'relative overflow-hidden inline-flex items-center justify-center gap-2 font-black transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl'
  
  const variants = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 ${pulse ? 'animate-pulse-glow' : ''}`,
    secondary: `bg-[#D4B996] hover:bg-white text-[#4B2C20] shadow-xl shadow-black/20 ${pulse ? 'animate-pulse-glow' : ''}`,
    outline: 'border-2 border-gray-200 hover:border-black text-gray-600 hover:text-black',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {showShimmer && (
        <div className="absolute inset-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
      )}
      {isLoading ? (
        <span className="animate-pulse">CARREGANDO...</span>
      ) : children}
    </button>
  )
}
