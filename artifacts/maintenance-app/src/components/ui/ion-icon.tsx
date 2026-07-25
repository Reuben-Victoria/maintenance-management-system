import type { CSSProperties, MouseEventHandler } from "react";

interface IonIconProps {
  name: string;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: string;
  onClick?: MouseEventHandler<HTMLElement>;
}

/**
 * Wrapper around Ionic Icons web component (<ion-icon>).
 * Uses a dynamic tag cast to avoid JSX intrinsic element type issues
 * with the custom web component in TypeScript strict mode.
 * Size is controlled via `style.fontSize` or a parent element's `font-size`.
 * Ionicons CDN scripts must be loaded in index.html for this to render.
 */
export function IonIcon({ name, className, style, ...rest }: IonIconProps) {
  // Cast the tag name to avoid TS2339 on the non-standard web component element
  const Tag = "ion-icon" as unknown as React.ElementType;
  return (
    <Tag
      name={name}
      class={className}
      style={{ display: "inline-block", lineHeight: 1, ...style }}
      {...rest}
    />
  );
}
