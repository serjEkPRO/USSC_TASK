import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/Tooltip.scss';

const Tooltipp = ({ children, text, position = "top" }) => {
  const [visible, setVisible] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState({});
  const tooltipRef = useRef();

  const showTooltip = (e) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipStyles({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      visibility: 'visible',
      zIndex: 2147483647, // максимальное значение z-index
    });
    setVisible(true);
  };

  const hideTooltip = () => {
    setVisible(false);
    setTooltipStyles({ visibility: 'hidden' });
  };

  return (
    <div
      className="tooltip-container"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {visible &&
        ReactDOM.createPortal(
          <div
            className={`tooltip-bubble tooltip-${position}`}
            ref={tooltipRef}
            style={tooltipStyles}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltipp;
