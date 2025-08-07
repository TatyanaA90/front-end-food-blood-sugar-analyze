import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  title: string;
  icon?: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  className?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ 
  title, 
  icon, 
  showBack = true, 
  backTo,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1); // Go back in browser history
    }
  };

  return (
    <header className={`navigation-header ${className}`}>
      <div className="navigation-header-content">
        <div className="navigation-buttons">
          {showBack && (
            <button
              onClick={handleBack}
              className="navigation-back-button"
              aria-label="Go back"
            >
              <ArrowLeft className="back-icon" />
              <span>Back</span>
            </button>
          )}
        </div>
        <div className="navigation-title-group">
          {icon && <span className="navigation-header-icon">{icon}</span>}
          <h1 className="navigation-title">{title}</h1>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader; 