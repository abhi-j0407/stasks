import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "lip-button--primary",
  secondary: "lip-button--secondary",
  destructive: "lip-button--destructive",
  ghost: "lip-button--ghost",
  disabled: "lip-button--disabled",
} as const;

type LipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function LipButton({
  variant = "primary",
  className,
  disabled,
  children,
  type = "button",
  ...props
}: LipButtonProps) {
  const isDisabled = disabled || variant === "disabled";
  const visual = isDisabled ? variants.disabled : variants[variant];

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={["lip-button", visual, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
