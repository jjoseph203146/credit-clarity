// Type declaration for the <doc-page> vanilla Web Component (registered by
// `public/doc-page.js`) so JSX/TSC accepts it as an intrinsic element.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "doc-page": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: "letter" | "a4" | "legal";
        orientation?: "landscape";
        margin?: string;
        width?: string;
        height?: string;
        "content-width"?: string;
        "content-height"?: string;
      };
    }
  }
}

export {};
