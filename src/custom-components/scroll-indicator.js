import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

// Show button when within 50px of the top
const VISIBILITY_THRESOLD_IN_PX = 50;

function ScrollIndicator({ headerRef }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition < VISIBILITY_THRESOLD_IN_PX);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = e => {
    e.preventDefault();
    const headerHeight = headerRef?.current?.offsetHeight || 0;
    window.scrollTo({
      top: window.innerHeight - headerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <a
      className={`ScrollIndicator${!isVisible ? ' ScrollIndicator--hidden' : ''}`}
      role="button"
      onClick={handleClick}
      >
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="ScrollIndicator-circle" cx="12" cy="12" r="10" />
        <path className="ScrollIndicator-chevron" d="M7 8L12 13L17 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path className="ScrollIndicator-chevron" d="M7 13L12 18L17 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

ScrollIndicator.propTypes = {
  headerRef: PropTypes.shape({
    current: PropTypes.shape({
      offsetHeight: PropTypes.number
    })
  })
};

ScrollIndicator.defaultProps = {
  headerRef: null
};

export default ScrollIndicator;
