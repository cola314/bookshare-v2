import { createElement } from "react";

interface UserAvatarProps {
  username?: string | null;
  profileImageUrl?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

function isSafeImageUrl(value: string): boolean {
  try {
    const parsed = new URL(value, "http://localhost");
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function UserAvatar({
  username,
  profileImageUrl,
  size = 40,
  className,
  alt,
}: UserAvatarProps) {
  const normalizedUsername = username?.trim() || "user";
  const safeProfileImageUrl = profileImageUrl && isSafeImageUrl(profileImageUrl) ? profileImageUrl : null;
  const dimensionStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  if (safeProfileImageUrl) {
    return (
      <img
        src={safeProfileImageUrl}
        alt={alt ?? normalizedUsername}
        className={className}
        style={{
          ...dimensionStyle,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid hsl(0, 0%, 71%)",
          display: "block",
        }}
      />
    );
  }

  return createElement("minidenticon-svg", {
    username: normalizedUsername,
    role: "img",
    "aria-label": alt ?? `${normalizedUsername} avatar`,
    className,
    style: dimensionStyle,
  });
}
