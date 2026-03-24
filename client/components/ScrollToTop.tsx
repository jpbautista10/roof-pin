import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top when the route changes (SPA default is to keep scroll position).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    void pathname;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
