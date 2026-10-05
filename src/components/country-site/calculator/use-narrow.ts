import { useEffect, useState } from "react";

/** True on phone-width screens. Charts use it to redraw with a narrower canvas and readable labels. */
export function useNarrow(max = 640) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${max}px)`);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [max]);
  return narrow;
}
