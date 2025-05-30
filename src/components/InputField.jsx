import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ label, type, value, onChange, showToggle, onToggle, placeholder }) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const handleToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
    if (onToggle) onToggle();
  };

  return (
    <div className="input-group">
      <input
        type={showToggle ? (isPasswordVisible ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        id={`input-${label.toLowerCase().replace(/\s/g, '-')}`}
      />
      {showToggle && (
        <button
          onClick={handleToggle}
          className="password-toggle"
          aria-label="Toggle password visibility"
        >
          <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
        </button>
      )}
    </div>
  );
};

export default InputField;