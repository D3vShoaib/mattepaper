import { useEffect, useRef, useState } from "react"

const MARQUEE_GAP = 32

/** Single-line text that scrolls in a loop only when it does not fit. */
export function Marquee({ children }: { children: string }) {
  const box = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(0)
  useEffect(() => {
    const measure = () => {
      if (!box.current || !text.current) return
      const width = text.current.getBoundingClientRect().width
      setOverflow(width > box.current.clientWidth + 1 ? width : 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (box.current) observer.observe(box.current)
    return () => observer.disconnect()
  }, [children])
  return (
    <div
      ref={box}
      className={`overflow-hidden whitespace-nowrap ${overflow ? "marquee-fade" : ""}`}
    >
      <div
        className={overflow ? "marquee-track flex w-max" : "flex w-max"}
        style={
          overflow
            ? ({
                "--marquee-distance": `-${overflow + MARQUEE_GAP}px`,
                "--marquee-duration": `${(overflow + MARQUEE_GAP) / 30}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <span ref={text}>{children}</span>
        {overflow > 0 && (
          <span aria-hidden="true" style={{ marginInlineStart: MARQUEE_GAP }}>
            {children}
          </span>
        )}
      </div>
    </div>
  )
}
