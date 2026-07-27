import * as React from "react"

const MOBILE_BREAKPOINT = 1280

export function useIsMobile() {
  // Starts `undefined` (not a window-dependent guess) so the client's first
  // render matches the server's exactly — reading window.innerWidth here
  // meant the client's very first paint could already disagree with the
  // server whenever the viewport was under the breakpoint, causing a
  // hydration mismatch (the Sidebar renders an entirely different DOM
  // shape for mobile vs desktop). The real value is filled in after mount.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
