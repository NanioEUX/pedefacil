interface FlowOSLogoProps {
  size?: number
  variant?: "full" | "icon" | "wordmark"
  className?: string
}

export function FlowOSLogo({ size = 32, variant = "full", className = "" }: FlowOSLogoProps) {
  const iconSize = size
  const fontSize = size * 0.35

  const Icon = () => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E7BFF" />
          <stop offset="100%" stopColor="#17D7FF" />
        </linearGradient>
        <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#17D7FF" />
          <stop offset="100%" stopColor="#00D98B" />
        </linearGradient>
      </defs>
      {/* Top ribbon - blue to cyan */}
      <path
        d="M12 18 C12 18, 20 12, 42 12 C50 12, 54 14, 54 18 C54 22, 50 24, 42 24 L12 24"
        stroke="url(#flowGrad1)" strokeWidth="7" strokeLinecap="round" fill="none"
      />
      {/* Middle ribbon - cyan to green */}
      <path
        d="M12 32 C12 32, 22 26, 46 26 C52 26, 56 28, 56 32 C56 36, 52 38, 46 38 L12 38"
        stroke="url(#flowGrad2)" strokeWidth="7" strokeLinecap="round" fill="none"
      />
      {/* Bottom ribbon - green accent */}
      <path
        d="M12 46 C12 46, 24 40, 40 40 C46 40, 50 42, 50 46 C50 50, 46 52, 40 52 L12 52"
        stroke="#00D98B" strokeWidth="7" strokeLinecap="round" fill="none"
      />
    </svg>
  )

  if (variant === "icon") return <div className={className}><Icon /></div>

  if (variant === "wordmark") {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="font-extrabold text-flow-white" style={{ fontSize }}>Flow</span>
        <span className="font-extrabold text-gradient" style={{ fontSize }}>OS</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Icon />
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="font-extrabold text-flow-white" style={{ fontSize }}>Flow</span>
          <span className="font-extrabold text-gradient" style={{ fontSize }}>OS</span>
        </div>
        {size >= 28 && (
          <span className="text-[0.5em] font-medium uppercase tracking-[0.35em] text-flow-gray" style={{ fontSize: fontSize * 0.4 }}>
            Food Service OS
          </span>
        )}
      </div>
    </div>
  )
}

export function Favicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#07101D" />
      <defs>
        <linearGradient id="favGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E7BFF" />
          <stop offset="100%" stopColor="#17D7FF" />
        </linearGradient>
        <linearGradient id="favGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#17D7FF" />
          <stop offset="100%" stopColor="#00D98B" />
        </linearGradient>
      </defs>
      <path d="M14 18 C14 18, 20 13, 38 13 C44 13, 47 15, 47 18 C47 21, 44 23, 38 23 L14 23" stroke="url(#favGrad1)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M14 32 C14 32, 21 27, 41 27 C46 27, 49 29, 49 32 C49 35, 46 37, 41 37 L14 37" stroke="url(#favGrad2)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M14 46 C14 46, 23 41, 35 41 C40 41, 43 43, 43 46 C43 49, 40 51, 35 51 L14 51" stroke="#00D98B" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  )
}
