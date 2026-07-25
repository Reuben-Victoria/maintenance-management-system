import { CSSProperties } from "react";

// Declare ion-icon as a valid JSX element (Ionic Web Component)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": {
        name?: string;
        class?: string;
        style?: CSSProperties;
        slot?: string;
        "aria-hidden"?: string;
        role?: string;
        onClick?: React.MouseEventHandler<HTMLElement>;
      };
    }
  }
}

interface IonIconProps {
  name: string;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * Wrapper around Ionic Icons web component (<ion-icon>).
 * Size is controlled via `style.fontSize` or a parent element's `font-size`.
 * Ionicons CDN scripts must be loaded in index.html for this to render.
 */
export function IonIcon({ name, className, style, ...rest }: IonIconProps) {
  return (
    <ion-icon
      name={name}
      class={className}
      style={{ display: "inline-block", lineHeight: 1, ...style }}
      {...(rest as any)}
    />
  );
}
