interface IEPPLogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

function getSizeClasses(
  size: IEPPLogoProps["size"],
): string {
  if (size === "small") {
    return "h-12 w-12";
  }

  if (size === "large") {
    return "h-28 w-28";
  }

  return "h-16 w-16";
}

export function IEPPLogo({
  size = "medium",
  showText = true,
  subtitle,
  className = "",
}: IEPPLogoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-md ${getSizeClasses(
          size,
        )}`}
      >
        <img
          src="/logo-iepp.png"
          alt="Logo de IEPP"
          className="h-full w-full object-contain"
        />
      </div>

      {showText && (
        <div>
          <p className="font-black text-white">
            IEPP 2026
          </p>

          {subtitle && (
            <p className="text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}