import React from 'react';
import { Droplets, Info } from 'lucide-react';
import { useGlucoseUnitUtils } from '../../hooks/useGlucoseUnit';
import './GlucoseUnitSection.css';

const GlucoseUnitSection: React.FC = () => {
  const { preferredUnit, setPreferredUnit, getRangeLabels } = useGlucoseUnitUtils();
  const rangeLabels = getRangeLabels();

  const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = event.target.value as 'mg/dL' | 'mmol/L';
    setPreferredUnit(newUnit);
  };

  return (
    <div className="glucose-unit-section">
      <div className="glucose-unit-header">
        <h3 className="glucose-unit-title">
          <Droplets size={20} />
          Glucose Unit Preference
        </h3>
        <div className="glucose-unit-info">
          <Info size={16} />
          <span>This setting affects how glucose values are displayed throughout the app</span>
        </div>
      </div>

      <div className="glucose-unit-content">
        <div className="glucose-unit-selector">
          <label htmlFor="glucose-unit" className="glucose-unit-label">
            Preferred Unit:
          </label>
          <select
            id="glucose-unit"
            value={preferredUnit}
            onChange={handleUnitChange}
            className="glucose-unit-select"
          >
            <option value="mg/dL">mg/dL (US Standard)</option>
            <option value="mmol/L">mmol/L (International)</option>
          </select>
        </div>

        <div className="glucose-unit-ranges">
          <h4>Target Ranges ({preferredUnit}):</h4>
          <div className="glucose-range-list">
            <div className="glucose-range-item">
              <span className="glucose-range-label low">Low:</span>
              <span className="glucose-range-value">{rangeLabels.low}</span>
            </div>
            <div className="glucose-range-item">
              <span className="glucose-range-label normal">Normal:</span>
              <span className="glucose-range-value">{rangeLabels.normal}</span>
            </div>
            <div className="glucose-range-item">
              <span className="glucose-range-label high">High:</span>
              <span className="glucose-range-value">{rangeLabels.high}</span>
            </div>
          </div>
        </div>

        <div className="glucose-unit-note">
          <p>
            <strong>Note:</strong> Your glucose readings will be automatically converted and displayed in your preferred unit. 
            Original values are preserved in the database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlucoseUnitSection; 