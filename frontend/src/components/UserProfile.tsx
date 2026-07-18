import { useState, useRef, useEffect } from "react";
import { mdiLogout, mdiLogin } from "@mdi/js";
import { MdiIcon } from "./MdiIcon";
import type { User } from "../hooks/useAuth";

interface UserProfileProps {
  user: User | null;
  authEnabled: boolean;
  loading: boolean;
  onLogout: () => Promise<void>;
}

export function UserProfile({ user, authEnabled, loading, onLogout }: UserProfileProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!authEnabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-btn" style={{ opacity: 0.7, cursor: "default" }}>
          <span>Lade...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-container">
        <a href="/api/auth/login" className="login-btn" style={{ textDecoration: "none" }}>
          <MdiIcon path={mdiLogin} size={18} />
          <span>Anmelden mit Dex</span>
        </a>
      </div>
    );
  }

  const avatarChar = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="user-profile-container" ref={containerRef}>
      <button
        type="button"
        className="user-profile-btn"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
      >
        <div className="user-avatar">{avatarChar}</div>
        <span>{user.name}</span>
      </button>

      {dropdownOpen && (
        <div className="user-dropdown">
          <div className="user-dropdown-info">
            <span className="user-dropdown-name">{user.name}</span>
            {user.email && <span className="user-dropdown-email">{user.email}</span>}
          </div>
          <button
            type="button"
            className="user-dropdown-logout-btn"
            onClick={async () => {
              setDropdownOpen(false);
              await onLogout();
            }}
          >
            <MdiIcon path={mdiLogout} size={16} />
            <span>Abmelden</span>
          </button>
        </div>
      )}
    </div>
  );
}
