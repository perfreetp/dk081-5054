import { useEffect } from "react";
import { useOpsStore } from "@/store/useOpsStore";

export function useSimulator() {
  const tick = useOpsStore((s) => s.tick);

  useEffect(() => {
    const timer = setInterval(() => tick(), 1000);
    return () => clearInterval(timer);
  }, [tick]);
}
