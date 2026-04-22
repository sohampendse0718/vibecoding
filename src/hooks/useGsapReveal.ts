import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(selector: string, deps: unknown[] = []) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(selector);

      targets.forEach((target, index) => {
        gsap.fromTo(
          target,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            delay: index * 0.04,
            ease: "power2.out",
            scrollTrigger: {
              trigger: target,
              start: "top 86%",
            },
          },
        );
      });
    });

    return () => {
      ctx.revert();
    };
  }, deps);
}
