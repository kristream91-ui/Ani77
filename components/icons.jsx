import React from 'react'

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24'
}

const mk = (path, extra = {}) =>
  function Icon({ size = 20, className = '', ...rest }) {
    return (
      <svg {...base} width={size} height={size} className={className} aria-hidden="true" {...extra} {...rest}>
        {path}
      </svg>
    )
  }

export const Home = mk(<path d="M3 10.6 12 3l9 7.6V20a1 1 0 0 1-1 1h-5v-6.5H9V21H4a1 1 0 0 1-1-1z" />)
export const Compass = mk(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </>
)
export const Search = mk(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </>
)
export const Bookmark = mk(<path d="M6 3.5h12a.5.5 0 0 1 .5.5v17L12 17l-6.5 4V4a.5.5 0 0 1 .5-.5z" />)
export const User = mk(
  <>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </>
)
export const Play = mk(<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />)
export const Plus = mk(<path d="M12 5v14M5 12h14" />)
export const Check = mk(<path d="m4.5 12.5 5 5 10-11" />)
export const Star = ({ size = 16, className = '', filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
)
export const ChevronLeft = mk(<path d="m15 5-7 7 7 7" />)
export const ChevronRight = mk(<path d="m9 5 7 7-7 7" />)
export const X = mk(<path d="M6 6l12 12M18 6L6 18" />)
export const Globe = mk(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z" />
  </>
)
export const Sliders = mk(
  <>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </>
)
export const Trash = mk(
  <>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 13h9.4l.8-13" />
  </>
)
export const Sparkles = mk(
  <>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  </>
)
export const Clock = mk(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </>
)
export const LogOut = mk(<path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15M10 8l-4 4 4 4M6 12h9" />)

export const Flame = mk(
  <path d="M12 3c.6 3.2-1.2 4.4-2.4 5.8A6.6 6.6 0 0 0 8 13a4 4 0 0 0 8 0c0-1.4-.5-2.4-1.2-3.4-.6 1-1.4 1.6-2.1 1.8.6-2.6.4-5.4-.7-8.4z" />
)
export const Megaphone = mk(
  <>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1z" />
    <path d="M18 8.5a4.5 4.5 0 0 1 0 7" />
  </>
)
export const Heart = mk(
  <path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
)
export const Grid4 = mk(
  <>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </>
)
export const Bell = mk(
  <>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 5.5h15S18 12.5 18 8.5z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </>
)
