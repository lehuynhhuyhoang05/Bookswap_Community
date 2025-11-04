import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Chỉ cuộn mượt ở 2 trang login và register
    if (pathname === "/login" || pathname === "/register") {
      const scrollDuration = 600;
      const start = window.scrollY;
      const startTime = performance.now();

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, start * (1 - ease));

        if (progress < 1) requestAnimationFrame(animateScroll);
      };

      requestAnimationFrame(animateScroll);
    }
  }, [pathname]);

  return null;
}
