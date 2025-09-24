// hooks/use-overlay-toast.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number; // ms
};

export function useOverlayToast() {
  const { toast } = useToast();
  const [overlayVisible, setOverlayVisible] = useState(false);

  // track active overlay "slots" and timers so multiple toasts work well
  const activeCount = useRef(0);
  const timers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // cleanup on unmount
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
      activeCount.current = 0;
    };
  }, []);

  const showToast = useCallback(
    ({ title, description, duration = 3000 }: ToastOptions) => {
      // show overlay and bump counter
      activeCount.current += 1;
      setOverlayVisible(true);

      // call the underlying toast
      // keep passing the same option shape you already use
      toast({
        title,
        description,
        duration,
      });

      // create a local id for matching timer
      const id = Math.random().toString(36).slice(2);
      const timeoutId = window.setTimeout(() => {
        // timer finished for this toast
        activeCount.current = Math.max(0, activeCount.current - 1);
        timers.current.delete(id);
        if (activeCount.current === 0) setOverlayVisible(false);
      }, duration + 50); // slight buffer to ensure toast has closed

      timers.current.set(id, timeoutId);
      return id;
    },
    [toast]
  );

  const hideAll = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    activeCount.current = 0;
    setOverlayVisible(false);
  }, []);

  return {
    showToast,
    hideAll,
    overlayVisible,
  };
}
