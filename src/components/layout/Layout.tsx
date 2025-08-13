import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <Navbar />
            <main className="layout-main">
                {children}
            </main>
            <footer className="layout-footer" aria-label="Site footer">
                <div className="layout-footer-content">
                    <span className="layout-footer-copy">© 2025 Tatyana Ageyeva</span>
                </div>
            </footer>
        </div>
    );
};

export default Layout;