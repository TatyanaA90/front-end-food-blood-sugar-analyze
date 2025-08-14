import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import './Login.css';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    ((document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || (localStorage.getItem('theme-mode') as 'dark' | 'light') || 'light')
  );

  useEffect(() => {
    const current = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || (localStorage.getItem('theme-mode') as 'dark' | 'light') || 'light';
    setTheme(current);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>();

  const watchedUsername = watch('username');
  const watchedPassword = watch('password');

  useEffect(() => {
    // Clear any prior error when the user edits the form fields
    setError('');
  }, [watchedUsername, watchedPassword]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password. Please check your credentials and try again.');
      // Prevent navigation on error - stay on the same page
    }
  };

  return (
    <div className="landing-page">
      <nav className="landing-top-bar">
        <div className="landing-logo">
          <img
            src={theme === 'dark' ? '/assets/images/logo_light.png' : '/assets/images/Logo.png'}
            alt="App logo"
            width={32}
            height={32}
          />
          <span>🩸 Food & Blood Sugar Analyzer</span>
        </div>
        
        <div className="landing-top-buttons">
          <button className="landing-signin-btn" onClick={() => setShowLoginForm(true)}>
            Sign In
          </button>
          <button className="landing-join-btn" onClick={() => navigate('/register')}>
            Join
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION - ONLY 3 IMAGES ===== */}
      <section className="landing-hero-section">
        {/* Hero Images - Only 3 as requested */}
        <div className="landing-hero-images">
          <div className="landing-hero-image">
            <img 
              src="/assets/images/DiabeticDiet.jpeg" 
              alt="Diabetic Diet" 
            />
          </div>
          <div className="landing-hero-image">
            <img 
              src="/assets/images/StrategiesforBette.jpeg" 
              alt="Health Strategies" 
            />
          </div>
          <div className="landing-hero-image">
            <img 
              src="/assets/images/balanceddiet.jpeg" 
              alt="Balanced Diet" 
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Blood Sugar Management Made Easy
          </h1>
        </div>
      </section>

      {/* ===== DESCRIPTION SECTION ===== */}
      <section className="landing-description-section">
        <div className="landing-description-content">
          <p className="landing-description-text">
            A personal digital health diary that helps you set goals, track food, activity, and lifestyle factors via manual logs or CGMs and understand their impact on your health.
          </p>
        </div>
      </section>

      {/* ===== GRAPHICS SECTION ===== */}
      <section className="landing-graphics-section">
        <div className="landing-graphics-container">
          <div className="landing-graphics-item">
            <img 
              src="/assets/images/DataVisualization Illusrtation.jpeg" 
              alt="Data Visualization" 
            />
          </div>
          <div className="landing-graphics-item">
            <img 
              src="/assets/images/1751492041786.jpeg" 
              alt="Glucose Trend" 
            />
          </div>
          <div className="landing-graphics-item">
            <img 
              src="/assets/images/data-visualization-header.png" 
              alt="Data Visualization Header" 
            />
          </div>
          <div className="landing-graphics-item">
            <img 
              src="/assets/images/pre-diabetic-cgm-graph.jpg" 
              alt="Pre-Diabetic CGM Graph" 
            />
          </div>
          <div className="landing-graphics-item">
            <img 
              src="/assets/images/dreamstime_xxl_396608183.jpg" 
              alt="Digital Health Station" 
            />
          </div>
          <div className="landing-graphics-item">
            <img 
              src="/assets/images/F1.large.jpg" 
              alt="AGP Report CGM" 
            />
          </div>
        </div>
      </section>

      {/* ===== BOTTOM SECTION ===== */}
      <section className="landing-bottom-section">
        {/* Main Feature Image with Surrounding Stickers */}
        <div className="landing-feature-container">
          {/* Top Stickers */}
          <div className="landing-sticker landing-sticker-top-left">
            <img 
              src="/assets/images/glucometr.jpeg" 
              alt="Glucometer" 
            />
          </div>
          
          <div className="landing-sticker landing-sticker-top-right">
            <img 
              src="/assets/images/dd556a54-ac15-44c5-a02e-1ab7ad010705.jpeg" 
              alt="Health Food" 
            />
          </div>
          
          {/* Left Stickers */}
          <div className="landing-sticker landing-sticker-left-top">
            <img 
              src="/assets/images/pexels-beyza-yalcin-153182170-30892992.webp" 
              alt="Health Activity" 
            />
          </div>
          
          <div className="landing-sticker landing-sticker-left-bottom">
            <img 
              src="/assets/images/istockphoto-1280537808-1024x1024.jpg" 
              alt="Nutrition" 
            />
          </div>
          
          {/* Main Feature Image - 50% Smaller */}
          <div className="landing-feature-image">
            <img 
              src="/assets/images/Diabet_plate.jpg" 
              alt="Diabetic Plate" 
            />
          </div>
          
          {/* Right Stickers */}
          <div className="landing-sticker landing-sticker-right-top">
            <img 
              src="/assets/images/Health.jpg" 
              alt="Health" 
            />
          </div>
          
          <div className="landing-sticker landing-sticker-right-bottom">
            <img 
              src="/assets/images/istockphoto-1309582577-1024x1024.jpg" 
              alt="Healthy Lifestyle" 
            />
          </div>
        </div>

        {/* Showcase Content */}
        <h2 className="landing-showcase-title">
          A Better Health Management Experience
        </h2>
        
        <p className="landing-showcase-desc">
          Our comprehensive health tracking system is designed to help you monitor blood sugar levels, track nutrition, and maintain a healthy lifestyle with personalized insights and goal setting.
        </p>

        {/* Call to Action Buttons */}
        <div className="landing-cta-buttons">
          <button className="landing-cta-primary" onClick={() => navigate('/register')}>
            Start Your Health Journey
          </button>
          
          <button className="landing-cta-secondary" onClick={() => setShowLoginForm(true)}>
            Sign In to Your Account
            <ChevronDown className="landing-cta-arrow" />
          </button>
        </div>
      </section>

      {/* ===== LOGIN FORM OVERLAY - SIMPLE TABLE ===== */}
      {showLoginForm && (
        <div className="login-overlay">
          <div className="login-overlay-content">
            <button 
              className="login-close-btn"
              onClick={() => setShowLoginForm(false)}
            >
              ×
            </button>
            
            {/* Simple Login Table */}
            <div className="login-table-container">
              <div className="login-table">
                <h2 className="login-table-title">Sign In</h2>
                
                <form id="loginForm" className="login-form" onSubmit={handleSubmit(onSubmit)}>
                  {error && (
                    <div className="login-error">
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="login-table-row">
                    <label htmlFor="username" className="login-label">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      {...register('username', {
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters',
                        },
                      })}
                      className={`login-input ${
                        errors.username ? 'login-input-error' : 'login-input-normal'
                      }`}
                    />
                    {errors.username && (
                      <p className="login-error-text">{errors.username.message}</p>
                    )}
                  </div>

                  <div className="login-table-row">
                    <label htmlFor="password" className="login-label">
                      Password
                    </label>
                    <div className="login-password-container">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        {...register('password', {
                          required: 'Password is required',
                        })}
                        className={`login-input ${
                          errors.password ? 'login-input-error' : 'login-input-normal'
                        }`}
                      />
                      <button
                        type="button"
                        className="login-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="login-password-icon" />
                        ) : (
                          <Eye className="login-password-icon" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="login-error-text">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="login-table-actions">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="login-button"
                    >
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                    
                    <Link to="/forgot-password" className="login-forgot-link">
                      Forgot your password?
                    </Link>
                  </div>
                </form>

                <div className="login-table-footer">
                  <p>New to Blood Sugar Analyzer?</p>
                  <Link to="/register" className="login-footer-button">
                    Create new account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright (bottom-right), same subtle style used elsewhere */}
      <footer className="layout-footer" aria-label="Site footer">
        <div className="layout-footer-content">
          <span className="layout-footer-copy">© 2025 Tatyana Ageyeva</span>
        </div>
      </footer>
    </div>
  );
};

export default Login; 