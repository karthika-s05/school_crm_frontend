import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into document.body so popups are never clipped by
 * .crm-main overflow or stacked under the fixed sidebar/header.
 */
export default function ModalPortal({ children, lockScroll = true }) {
  useEffect(() => {
    if (!lockScroll) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lockScroll]);

  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
