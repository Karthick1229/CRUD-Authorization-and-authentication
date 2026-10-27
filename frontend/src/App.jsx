import { useEffect, useState } from "react";
import {
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BadgeCheck,
    Bell,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Command,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    Settings,
    Shield,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";
import api, { refreshCsrf } from "./services/api";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        refreshCsrf()
            .then(() => api.get("/auth/me"))
            .then(({ data }) => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, [location.pathname]);

    if (loading)
        return (
            <div className="screen-loading">
                <span className="loader" />
                Loading workspace
            </div>
        );

    return (
        <Routes>
            <Route
                path="/"
                element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
            />
            <Route
                path="/login"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <AuthPage mode="login" onAuthenticated={setUser} />
                    )
                }
            />
            <Route
                path="/register"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <AuthPage mode="register" onAuthenticated={setUser} />
                    )
                }
            />
            <Route path="/forgot-password" element={<PasswordResetInfo />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route
                path="/dashboard/*"
                element={
                    user ? (
                        <Dashboard
                            user={user}
                            onLogout={() => setUser(null)}
                            onUserUpdated={setUser}
                        />
                    ) : (
                        <Navigate to="/login" replace state={{ from: location.pathname }} />
                    )
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function Brand({ compact = false }) {
    return (
        <Link className={`brand ${compact ? "brand-compact" : ""}`} to="/">
            <span className="brand-mark">
                <ShieldCheck size={18} />
            </span>
            <span>
                secure<span className="brand-light">gate</span>
            </span>
        </Link>
    );
}

function Landing() {
    return (
        <main className="landing">
            <nav className="landing-nav">
                <Brand />
                <div className="landing-links">
                    <a href="#platform">Platform</a>
                    <a href="#security">Security</a>
                    <Link to="/login" className="nav-login">
                        Sign in
                    </Link>
                    <Link to="/register" className="button button-dark">
                        Create account <ArrowUpRight size={15} />
                    </Link>
                </div>
            </nav>
            <section className="landing-hero" id="platform">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <span className="eyebrow-dot" /> ACCESS, MADE ACCOUNTABLE
                    </span>
                    <h1>
                        One place to
                        <br />
                        <span>manage who</span>
                        <br />
                        gets in.
                    </h1>
                    <p>
                        Clear roles. Confident access. SecureGate gives your team a
                        dependable foundation for identity and access management.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="button button-dark button-large">
                            Get started <ArrowUpRight size={17} />
                        </Link>
                        <Link to="/login" className="text-link">
                            Sign in to your account <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div className="trust-note">
                        <span className="trust-avatars">
                            <i>J</i>
                            <i>A</i>
                            <i>M</i>
                        </span>
                        <span>Built for teams that take access seriously</span>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-grid" />
                    <div className="security-orbit orbit-one" />
                    <div className="security-orbit orbit-two" />
                    <div className="access-panel">
                        <div className="panel-top">
                            <span className="panel-label">SECURITY CONTROLS</span>
                            <span className="panel-period">ACTIVE</span>
                        </div>
                        <div className="access-total">
                            <strong>Protected</strong>
                            <span className="growth">
                                <BadgeCheck size={14} /> ACTIVE
                            </span>
                        </div>
                        <div className="access-caption">Session-based access controls</div>
                        <div className="landing-controls">
                            <div>
                                <ShieldCheck size={15} />
                                <span>HttpOnly session cookie</span>
                                <b>On</b>
                            </div>
                            <div>
                                <BadgeCheck size={15} />
                                <span>CSRF request validation</span>
                                <b>On</b>
                            </div>
                            <div>
                                <Users size={15} />
                                <span>Server-side role checks</span>
                                <b>On</b>
                            </div>
                        </div>
                    </div>
                    <div className="floating-badge">
                        <span>
                            <BadgeCheck size={17} />
                        </span>
                        <div>
                            <b>Role enforcement</b>
                            <small>Checked by the API</small>
                        </div>
                    </div>
                    <div className="visual-caption">
                        <span>IDENTITY & ACCESS</span>
                        <span>01 / 04</span>
                    </div>
                </div>
            </section>
            <section className="landing-strip" id="security">
                <span>SECURITY SHOULD FEEL SIMPLE.</span>
                <div>
                    <Shield size={16} />
                    <span>Encrypted sessions</span>
                    <i />
                    <Users size={16} />
                    <span>Role-based access</span>
                    <i />
                    <Activity size={16} />
                    <span>Auditable by design</span>
                </div>
            </section>
        </main>
    );
}

function AuthPage({ mode, onAuthenticated }) {
    const isRegister = mode === "register";
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setError("");
        if (form.password.length < 12) {
            setError("Use a password with at least 12 characters.");
            return;
        }
        setBusy(true);
        try {
            await refreshCsrf();
            if (isRegister) await api.post("/auth/register", form);
            const { data } = await api.post("/auth/login", {
                email: form.email,
                password: form.password,
            });
            onAuthenticated(data);
            navigate("/dashboard");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "We could not complete that request. Check the API connection and try again.",
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="auth-shell">
            <section className="auth-art">
                <Brand />
                <div className="auth-art-copy">
                    <span className="eyebrow">
                        <span className="eyebrow-dot" /> SECURE BY DEFAULT
                    </span>
                    <h1>
                        Access that
                        <br />
                        keeps its
                        <br />
                        <em>promise.</em>
                    </h1>
                    <p>
                        People, permissions, and peace of mind. Together in one considered
                        workspace.
                    </p>
                </div>
                <div className="auth-art-foot">
                    <span>SECUREGATE / IDENTITY SYSTEM</span>
                    <span>01 — 2026</span>
                </div>
                <div className="auth-art-rings" />
            </section>
            <section className="auth-form-side">
                <Link to="/" className="back-home">
                    <ChevronLeft size={16} /> Back to overview
                </Link>
                <div className="auth-form-wrap">
                    <span className="form-kicker">
                        {isRegister ? "START WITH A SECURE FOUNDATION" : "WELCOME BACK"}
                    </span>
                    <h2>
                        {isRegister ? "Create your account" : "Sign in to SecureGate"}
                    </h2>
                    <p className="form-intro">
                        {isRegister
                            ? "Your account starts with standard access. An administrator can update your role later."
                            : "Enter your credentials to continue to your workspace."}
                    </p>
                    <form onSubmit={submit} className="auth-form">
                        {isRegister && (
                            <label>
                                Full name
                                <input
                                    required
                                    maxLength="100"
                                    autoComplete="name"
                                    placeholder="Jordan Lee"
                                    value={form.fullName}
                                    onChange={(event) =>
                                        setForm({ ...form, fullName: event.target.value })
                                    }
                                />
                            </label>
                        )}
                        <label>
                            Email address
                            <input
                                required
                                type="email"
                                autoComplete="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={(event) =>
                                    setForm({ ...form, email: event.target.value })
                                }
                            />
                        </label>
                        <label>
                            Password
                            <input
                                required
                                type="password"
                                minLength="12"
                                autoComplete={isRegister ? "new-password" : "current-password"}
                                placeholder={
                                    isRegister ? "At least 12 characters" : "Enter your password"
                                }
                                value={form.password}
                                onChange={(event) =>
                                    setForm({ ...form, password: event.target.value })
                                }
                            />
                            {isRegister && (
                                <small className="field-note">
                                    Use 12 or more characters for stronger protection.
                                </small>
                            )}
                        </label>
                        {error && (
                            <div role="alert" className="form-error">
                                {error}
                            </div>
                        )}
                        <button disabled={busy} className="button button-dark auth-submit">
                            {busy
                                ? "Please wait…"
                                : isRegister
                                    ? "Create account"
                                    : "Sign in"}{" "}
                            <ArrowUpRight size={16} />
                        </button>
                    </form>
                    <div className="auth-switch">
                        {isRegister ? "Already have an account?" : "New to SecureGate?"}{" "}
                        <Link to={isRegister ? "/login" : "/register"}>
                            {isRegister ? "Sign in" : "Create an account"}
                        </Link>
                        {!isRegister && (
                            <Link className="forgot-link" to="/forgot-password">
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="auth-security">
                        <ShieldCheck size={15} /> Protected with encrypted sessions and
                        secure password hashing
                    </div>
                </div>
            </section>
        </main>
    );
}

function Dashboard({ user, onLogout, onUserUpdated }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activePage, setActivePage] = useState("Overview");
    const navigate = useNavigate();
    const isAdmin = user.role === "ADMIN";
    const initial = user.fullName?.charAt(0)?.toUpperCase() || "U";
    async function logout() {
        try {
            await refreshCsrf();
            await api.post("/auth/logout");
        } finally {
            onLogout();
            navigate("/");
        }
    }

    return (
        <div className="dashboard-shell">
            <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-brand">
                    <Brand compact />
                    <button
                        className="icon-button mobile-close"
                        aria-label="Close navigation"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="workspace-switch">
                    <span className="workspace-icon">
                        <Command size={17} />
                    </span>
                    <span>
                        <b>Northstar Studio</b>
                        <small>Workspace</small>
                    </span>
                    <ChevronDown size={15} />
                </div>
                <span className="nav-section-label">WORKSPACE</span>
                <nav className="side-nav">
                    <button
                        className={
                            activePage === "Overview" ? "side-link selected" : "side-link"
                        }
                        onClick={() => setActivePage("Overview")}
                    >
                        <LayoutDashboard size={17} /> Overview
                    </button>
                    {isAdmin && (
                        <button
                            className={
                                activePage === "Members" ? "side-link selected" : "side-link"
                            }
                            onClick={() => setActivePage("Members")}
                        >
                            <Users size={17} /> Members{" "}
                            <span className="nav-count">
                                {activePage === "Members" ? "01" : ""}
                            </span>
                        </button>
                    )}
                    <button
                        className={
                            activePage === "Security" ? "side-link selected" : "side-link"
                        }
                        onClick={() => setActivePage("Security")}
                    >
                        <ShieldCheck size={17} /> Security
                    </button>
                </nav>
                <span className="nav-section-label tools-label">PREFERENCES</span>
                <nav className="side-nav">
                    <button
                        className={
                            activePage === "Settings" ? "side-link selected" : "side-link"
                        }
                        onClick={() => setActivePage("Settings")}
                    >
                        <Settings size={17} /> Settings
                    </button>
                    <button className="side-link" onClick={() => setActivePage("Help")}>
                        <CircleHelp size={17} /> Help center
                    </button>
                </nav>
                <div className="sidebar-bottom">
                    <div className="plan-note">
                        <div className="plan-icon">
                            <Shield size={15} />
                        </div>
                        <div>
                            <b>Secure by design</b>
                            <small>Session protection is on</small>
                        </div>
                        <span className="online-dot" />
                    </div>
                    <button className="profile-row" onClick={logout}>
                        <span className="avatar">{initial}</span>
                        <span>
                            <b>{user.fullName}</b>
                            <small>{user.email}</small>
                        </span>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
            {mobileOpen && (
                <button
                    className="sidebar-scrim"
                    aria-label="Close navigation"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <main className="dashboard-main">
                <header className="topbar">
                    <button
                        className="icon-button menu-button"
                        aria-label="Open navigation"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu size={19} />
                    </button>
                    <div className="breadcrumbs">
                        Workspace <ChevronRight size={14} /> <b>{activePage}</b>
                    </div>
                    <div className="topbar-actions">
                        <div className="top-search">
                            <Search size={16} />
                            <span>Search anything</span>
                            <kbd>⌘ K</kbd>
                        </div>
                        <button
                            className="icon-button notification-button"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            <i />
                        </button>
                        <span className="topbar-divider" />
                        <span className="top-avatar">{initial}</span>
                        <div className="top-user">
                            <b>{user.fullName}</b>
                            <small>{isAdmin ? "Administrator" : "Member"}</small>
                        </div>
                        <ChevronDown size={14} className="top-chevron" />
                    </div>
                </header>
                {activePage === "Members" && isAdmin ? (
                    <MembersPage />
                ) : activePage === "Settings" ? (
                    <SettingsPage user={user} onUpdated={onUserUpdated} />
                ) : (
                    <OverviewPage user={user} page={activePage} />
                )}
            </main>
        </div>
    );
}

function OverviewPage({ user, page }) {
    const isAdmin = user.role === "ADMIN";
    const [stats, setStats] = useState(null);
    useEffect(() => {
        if (isAdmin)
            api
                .get("/admin/dashboard/stats")
                .then(({ data }) => setStats(data))
                .catch(() => setStats(null));
    }, [isAdmin]);
    return (
        <div className="page-content">
            <div className="page-heading">
                <div>
                    <div className="date-line">
                        MONDAY, OCTOBER 26, 2026 <span /> WORKSPACE OVERVIEW
                    </div>
                    <h1>
                        {page === "Overview" ? (
                            <>
                                Good morning, {user.fullName.split(" ")[0]}
                                <span className="greeting-period">.</span>
                            </>
                        ) : (
                            page
                        )}
                    </h1>
                    <p>
                        {page === "Overview"
                            ? "Here’s what’s happening with access across your workspace."
                            : "Your workspace access and account details at a glance."}
                    </p>
                </div>
                <button
                    className="button button-outline"
                    onClick={() => window.location.reload()}
                >
                    <Activity size={15} /> Refresh data
                </button>
            </div>
            {isAdmin && (
                <div className="stats-grid">
                    <StatCard
                        label="Total members"
                        value={stats?.totalUsers?.toLocaleString() ?? "—"}
                        change="Accounts in workspace"
                        icon={<Users size={17} />}
                        trend="up"
                    />
                    <StatCard
                        label="Active accounts"
                        value={stats?.activeUsers?.toLocaleString() ?? "—"}
                        change="Currently enabled"
                        icon={<BadgeCheck size={17} />}
                        trend="up"
                    />
                    <StatCard
                        label="Administrators"
                        value={stats?.administrators?.toLocaleString() ?? "—"}
                        change="Elevated access"
                        icon={<ShieldCheck size={17} />}
                        trend="neutral"
                    />
                    <StatCard
                        label="Session security"
                        value="On"
                        change="HttpOnly session cookies"
                        icon={<Shield size={17} />}
                        trend="secure"
                    />
                </div>
            )}
            <div className="content-grid">
                <section className="surface activity-surface">
                    <div className="surface-heading">
                        <div>
                            <span className="surface-overline">ACCESS ACTIVITY</span>
                            <h2>Authentication activity</h2>
                        </div>
                        <button className="icon-button" aria-label="More activity options">
                            <ChevronDown size={17} />
                        </button>
                    </div>
                    <div className="activity-empty">
                        <Activity size={21} />
                        <b>Audit history is not enabled</b>
                        <p>
                            Sign-ins work normally. This demo does not store or report
                            authentication events.
                        </p>
                    </div>
                </section>
                <section className="surface security-surface">
                    <div className="surface-heading">
                        <div>
                            <span className="surface-overline">ACCOUNT HEALTH</span>
                            <h2>Security posture</h2>
                        </div>
                        <span className="secure-label">
                            <i /> SECURE
                        </span>
                    </div>
                    <div className="security-score">
                        <div className="security-check-icon">
                            <ShieldCheck size={23} />
                        </div>
                        <div>
                            <b>Core protections enabled</b>
                            <p>
                                Session cookies, CSRF checks, and server-side role rules are
                                configured.
                            </p>
                        </div>
                    </div>
                    <div className="security-list">
                        <div>
                            <span>
                                <i className="check-dot">
                                    <BadgeCheck size={12} />
                                </i>{" "}
                                Password protection
                            </span>
                            <b>Enabled</b>
                        </div>
                        <div>
                            <span>
                                <i className="check-dot">
                                    <BadgeCheck size={12} />
                                </i>{" "}
                                Role restrictions
                            </span>
                            <b>Enabled</b>
                        </div>
                        <div>
                            <span>
                                <i className="check-dot">
                                    <BadgeCheck size={12} />
                                </i>{" "}
                                Secure sessions
                            </span>
                            <b>Enabled</b>
                        </div>
                    </div>
                    <button className="security-link">
                        Review security settings <ArrowUpRight size={14} />
                    </button>
                </section>
            </div>
            <div className="bottom-grid">
                <section className="surface quick-surface">
                    <div className="surface-heading">
                        <div>
                            <span className="surface-overline">QUICK ACCESS</span>
                            <h2>Workspace shortcuts</h2>
                        </div>
                    </div>
                    <div className="shortcut-row">
                        <Shortcut
                            icon={<Users size={18} />}
                            label="Manage members"
                            sub="Invite or update access"
                        />
                        <Shortcut
                            icon={<ShieldCheck size={18} />}
                            label="Review permissions"
                            sub="Check role assignments"
                        />
                        <Shortcut
                            icon={<Settings size={18} />}
                            label="Account settings"
                            sub="Update your profile"
                        />
                    </div>
                </section>
                <section className="surface session-surface">
                    <div className="surface-heading">
                        <div>
                            <span className="surface-overline">CURRENT SESSION</span>
                            <h2>This device</h2>
                        </div>
                        <span className="live-dot" />
                    </div>
                    <div className="session-info">
                        <span className="device-icon">
                            <Command size={19} />
                        </span>
                        <div>
                            <b>Browser session</b>
                            <small>Active now · This device</small>
                        </div>
                        <span className="current-tag">CURRENT</span>
                    </div>
                    <div className="session-foot">
                        <span>
                            Authenticated as <b>{user.email}</b>
                        </span>
                        <span>
                            <i /> Encrypted
                        </span>
                    </div>
                </section>
            </div>
            <footer className="page-footer">
                <span>
                    SECUREGATE <i /> ACCESS MANAGEMENT
                </span>
                <span>Built on trust. Protected by design.</span>
            </footer>
        </div>
    );
}

function StatCard({ label, value, change, icon, trend }) {
    return (
        <article className="stat-card">
            <div className="stat-top">
                <span>{label}</span>
                <i>{icon}</i>
            </div>
            <div className="stat-value">{value}</div>
            <div className={`stat-change ${trend}`}>
                <span>
                    {trend === "up" ? (
                        <ArrowUpRight size={13} />
                    ) : trend === "secure" ? (
                        <BadgeCheck size={13} />
                    ) : (
                        <ArrowDownRight size={13} />
                    )}
                </span>
                {change}
            </div>
        </article>
    );
}
function Shortcut({ icon, label, sub }) {
    return (
        <button className="shortcut-item">
            <span className="shortcut-icon">{icon}</span>
            <span>
                <b>{label}</b>
                <small>{sub}</small>
            </span>
            <ArrowUpRight size={15} className="shortcut-arrow" />
        </button>
    );
}

function MembersPage() {
    const [result, setResult] = useState({
        content: [],
        totalPages: 0,
        totalElements: 0,
    });
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [page, setPage] = useState(0);
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(true);

    async function load() {
        setBusy(true);
        try {
            const params = { query, page, size: 8 };
            if (activeFilter !== "all") params.active = activeFilter === "active";
            const { data } = await api.get("/admin/users", { params });
            setResult(data);
        } catch {
            setNotice(
                "Could not load members. Confirm your admin access and API connection.",
            );
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        load();
    }, [query, activeFilter, page]);

    async function setActive(member) {
        const action = member.active ? "deactivate" : "activate";
        if (
            !window.confirm(`Are you sure you want to ${action} ${member.fullName}?`)
        )
            return;
        try {
            await api.patch(`/admin/users/${member.id}/status`, {
                active: !member.active,
            });
            setNotice(`${member.fullName} status updated.`);
            await load();
        } catch {
            setNotice("The account status could not be updated.");
        }
    }

    async function changeRole(member, role) {
        try {
            await api.patch(`/admin/users/${member.id}/role`, { role });
            setNotice(`${member.fullName} role changed to ${role}.`);
            await load();
        } catch {
            setNotice("The account role could not be changed.");
        }
    }

    return (
        <div className="page-content members-page">
            <div className="page-heading">
                <div>
                    <div className="date-line">WORKSPACE / ADMINISTRATION</div>
                    <h1>
                        Members<span className="greeting-period">.</span>
                    </h1>
                    <p>Manage people and the access they have across your workspace.</p>
                </div>
                <button
                    className="button button-dark"
                    onClick={() =>
                        setNotice(
                            "Public registration is open. Share the registration page with your teammate.",
                        )
                    }
                >
                    <Users size={15} /> Add member
                </button>
            </div>
            {notice && (
                <div className="notice" role="status">
                    {notice}
                    <button onClick={() => setNotice("")} aria-label="Dismiss">
                        <X size={14} />
                    </button>
                </div>
            )}
            <section className="surface members-surface">
                <div className="members-toolbar">
                    <div className="members-total">
                        <b>{result.totalElements}</b>
                        <span>members</span>
                    </div>
                    <div className="member-search">
                        <Search size={16} />
                        <input
                            placeholder="Search people…"
                            value={query}
                            onChange={(event) => {
                                setPage(0);
                                setQuery(event.target.value);
                            }}
                        />
                        <kbd>/</kbd>
                    </div>
                    <label className="status-filter-label">
                        <span className="sr-only">Filter members by account status</span>
                        <select
                            className="status-filter"
                            value={activeFilter}
                            onChange={(event) => {
                                setPage(0);
                                setActiveFilter(event.target.value);
                            }}
                        >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </label>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>MEMBER</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>JOINED</th>
                                <th>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {busy ? (
                                <tr>
                                    <td colSpan="5" className="table-state">
                                        <span className="loader" /> Loading members
                                    </td>
                                </tr>
                            ) : result.content.length ? (
                                result.content.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="member-cell">
                                                <span className="member-avatar">
                                                    {member.fullName.charAt(0)}
                                                </span>
                                                <span>
                                                    <b>{member.fullName}</b>
                                                    <small>{member.email}</small>
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="role-select"
                                                aria-label={`Role for ${member.fullName}`}
                                                value={member.role}
                                                onChange={(event) =>
                                                    changeRole(member, event.target.value)
                                                }
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span
                                                className={`status-label ${member.active ? "active" : "inactive"}`}
                                            >
                                                <i />
                                                {member.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="joined-date">
                                            {new Date(member.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td>
                                            <button
                                                className="table-action"
                                                onClick={() => setActive(member)}
                                            >
                                                {member.active ? "Deactivate" : "Activate"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="table-state">
                                        No members match that search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="table-pagination">
                    <span>
                        Showing {result.content.length ? page * 8 + 1 : 0}–
                        {Math.min((page + 1) * 8, result.totalElements)} of{" "}
                        {result.totalElements}
                    </span>
                    <div>
                        <button
                            aria-label="Previous page"
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span>
                            {page + 1} / {Math.max(result.totalPages, 1)}
                        </span>
                        <button
                            aria-label="Next page"
                            disabled={page + 1 >= result.totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function SettingsPage({ user, onUpdated }) {
    const [fullName, setFullName] = useState(user.fullName);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    async function saveProfile(event) {
        event.preventDefault();
        try {
            const { data } = await api.put("/users/me", { fullName });
            setMessage("Profile updated.");
            onUpdated(data);
        } catch {
            setMessage("Profile could not be updated.");
        }
    }
    async function savePassword(event) {
        event.preventDefault();
        try {
            await api.put("/users/me/password", { currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setMessage("Password updated successfully.");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Password could not be updated.",
            );
        }
    }
    return (
        <div className="page-content settings-page">
            <div className="page-heading">
                <div>
                    <div className="date-line">WORKSPACE / PREFERENCES</div>
                    <h1>
                        Settings<span className="greeting-period">.</span>
                    </h1>
                    <p>Manage your personal information and account security.</p>
                </div>
            </div>
            {message && (
                <div className="notice" role="status">
                    {message}
                    <button onClick={() => setMessage("")} aria-label="Dismiss">
                        <X size={14} />
                    </button>
                </div>
            )}
            <div className="settings-grid">
                <section className="surface settings-panel">
                    <span className="surface-overline">PERSONAL INFORMATION</span>
                    <h2>Your profile</h2>
                    <p className="settings-intro">
                        Update how your name appears around the workspace.
                    </p>
                    <form onSubmit={saveProfile} className="settings-form">
                        <label>
                            Full name
                            <input
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                required
                                maxLength="100"
                            />
                        </label>
                        <label>
                            Email address
                            <input value={user.email} disabled />
                        </label>
                        <div>
                            <button className="button button-dark">Save profile</button>
                        </div>
                    </form>
                </section>
                <section className="surface settings-panel">
                    <span className="surface-overline">ACCOUNT SECURITY</span>
                    <h2>Change password</h2>
                    <p className="settings-intro">
                        Choose a password with at least 12 characters.
                    </p>
                    <form onSubmit={savePassword} className="settings-form">
                        <label>
                            Current password
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                required
                            />
                        </label>
                        <label>
                            New password
                            <input
                                type="password"
                                minLength="12"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                required
                            />
                        </label>
                        <div>
                            <button className="button button-dark">Update password</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

function NotFound() {
    return (
        <main className="not-found">
            <Brand />
            <span>404 / NOT FOUND</span>
            <h1>This page isn't here.</h1>
            <Link className="button button-dark" to="/">
                Return to SecureGate <ArrowUpRight size={15} />
            </Link>
        </main>
    );
}
function AccessDenied() {
    return (
        <main className="not-found">
            <Brand />
            <span>403 / ACCESS DENIED</span>
            <h1>This area is restricted.</h1>
            <p>Your account does not have permission to view this page.</p>
            <Link className="button button-dark" to="/dashboard">
                Return to workspace <ArrowUpRight size={15} />
            </Link>
        </main>
    );
}

function PasswordResetInfo() {
    return (
        <main className="not-found">
            <Brand />
            <span>ACCOUNT RECOVERY</span>
            <h1>Password reset is not configured.</h1>
            <p>
                This demo does not issue reset links without a verified email delivery
                service.
            </p>
            <Link className="button button-dark" to="/login">
                Back to sign in <ArrowUpRight size={15} />
            </Link>
        </main>
    );
}

export default App;
