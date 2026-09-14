import { CalendarIcon, ChatIcon, LogoutIcon, OverviewIcon } from "./icons";

export type MainView = "calendar" | "overview";

type SidebarProps = {
  userName: string;
  activeView: MainView;
  onNavigate: (view: MainView) => void;
  chatOpen: boolean;
  onToggleChat: () => void;
  onLogout: () => void;
};

export function Sidebar({
  userName,
  activeView,
  onNavigate,
  chatOpen,
  onToggleChat,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__user">
        <span className="sidebar__user-avatar" aria-hidden="true" />
        <span>{userName.split("@")[0]}</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <button
          type="button"
          className="sidebar__item"
          aria-current={activeView === "calendar"}
          onClick={() => onNavigate("calendar")}
        >
          <CalendarIcon />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          className="sidebar__item"
          aria-current={activeView === "overview"}
          onClick={() => onNavigate("overview")}
        >
          <OverviewIcon />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className="sidebar__item"
          aria-expanded={chatOpen}
          aria-controls="chat-drawer"
          onClick={onToggleChat}
        >
          <ChatIcon />
          <span>Chat AI</span>
        </button>
      </nav>

      <div className="sidebar__logout">
        <button type="button" onClick={onLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}