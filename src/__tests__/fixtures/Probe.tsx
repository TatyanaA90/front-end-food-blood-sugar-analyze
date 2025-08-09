import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export function Probe() {
    const { user, login, logout, register, updateUser, isLoading } = useAuth();
    const [username, setUsername] = useState("testuser");
    const [password, setPassword] = useState("testpass");
    const [email, setEmail] = useState("new@example.com");
    const [error, setError] = useState<string>("");

    if (isLoading) return <div data-testid="auth-loading">loading</div>;

    const handleLogin = async () => {
        setError("");
        try {
            await login(username, password);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const handleRegister = async () => {
        setError("");
        try {
            await register(username, email, password);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const handleLogout = () => {
        setError("");
        logout();
    };

    const handleUpdateUser = () => {
        setError("");
        updateUser({ name: "Updated Name" });
    };

    return (
        <div>
            <div data-testid="auth-state">{user ? "yes" : "no"}</div>
            <div data-testid="user-name">{user ? user.username ?? "user" : ""}</div>
            <div data-testid="user-display-name">{user ? user.name ?? "" : ""}</div>
            {error ? <div data-testid="auth-error">{error}</div> : null}

            <input
                data-testid="username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                data-testid="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                data-testid="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button data-testid="login" onClick={handleLogin}>
                Login
            </button>
            <button data-testid="register" onClick={handleRegister}>
                Register
            </button>
            <button data-testid="update-user" onClick={handleUpdateUser}>
                UpdateUser
            </button>
            <button data-testid="logout" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}
