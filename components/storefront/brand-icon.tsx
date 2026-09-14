import type { SimpleIcon } from "simple-icons";

type BrandIconProps = {
  icon: SimpleIcon;
  className?: string;
  /** Use brand hex color; default inherits currentColor */
  branded?: boolean;
  title?: string;
};

/** Renders a Simple Icons glyph as an inline SVG. */
export function BrandIcon({
  icon,
  className,
  branded = false,
  title,
}: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={title ? undefined : true}
      fill={branded ? `#${icon.hex}` : "currentColor"}
    >
      {title ? <title>{title}</title> : null}
      <path d={icon.path} />
    </svg>
  );
}
