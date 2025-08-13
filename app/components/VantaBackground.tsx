"use client";
import { useEffect, useRef } from "react";

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vantaEffect: any;
    let scriptThree: HTMLScriptElement | null = null;
    let scriptVanta: HTMLScriptElement | null = null;
    if (typeof window !== "undefined" && vantaRef.current) {
      scriptThree = document.createElement("script");
      scriptThree.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
      scriptThree.async = true;
      document.head.appendChild(scriptThree);

      scriptVanta = document.createElement("script");
      scriptVanta.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js";
      scriptVanta.async = true;
      document.head.appendChild(scriptVanta);

      scriptVanta.onload = () => {
        // @ts-ignore
        if (window.VANTA && window.VANTA.NET) {
          // @ts-ignore
          vantaEffect = window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x5E6AD2,
            backgroundColor: 0x101014,
            points: 8.00,
            maxDistance: 25.00,
            spacing: 20.00
          });
        }
      };
    }
    return () => {
      if (vantaEffect && typeof vantaEffect.destroy === "function") {
        vantaEffect.destroy();
      }
      if (scriptThree) document.head.removeChild(scriptThree);
      if (scriptVanta) document.head.removeChild(scriptVanta);
    };
  }, []);

  return <div ref={vantaRef} className="absolute inset-0 z-0" />;
}
