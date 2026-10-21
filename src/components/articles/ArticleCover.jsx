import { coverTheme } from '../../lib/format'

/** Generated pastel cover: layered lavender gradients plus a soft ribbon, varied per id. */
export default function ArticleCover({ id, className = '' }) {
  const { hue, angle } = coverTheme(id)

  const background = {
    backgroundColor: `hsl(${hue} 100% 97%)`,
    backgroundImage: [
      `radial-gradient(at 15% 20%, hsl(${hue + 25} 100% 97%) 0, transparent 55%)`,
      `radial-gradient(at 85% 25%, hsl(${hue} 95% 85%) 0, transparent 50%)`,
      `radial-gradient(at 55% 95%, hsl(${hue - 15} 90% 87%) 0, transparent 55%)`,
      `linear-gradient(${angle}deg, hsl(${hue + 35} 100% 97%), hsl(${hue} 90% 91%))`,
    ].join(', '),
  }

  const ribbon = {
    borderColor: `hsl(${hue} 85% 72%)`,
    borderLeftColor: 'transparent',
    borderBottomColor: `hsl(${hue + 45} 85% 82%)`,
    transform: `rotate(${angle}deg)`,
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={background} aria-hidden="true">
      <div
        className="absolute top-[18%] -right-[20%] h-[130%] w-[85%] rounded-[45%] border-[12px] opacity-60 blur-[1.5px]"
        style={ribbon}
      />
    </div>
  )
}
