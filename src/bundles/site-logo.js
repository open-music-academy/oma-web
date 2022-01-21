import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import urls from '@educandu/educandu/utils/urls.js';

function SiteLogo({ readonly, size }) {
  const renderImage = () => (
    <svg
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 64 64"
      height="64px"
      width="64px"
      className={`SiteLogo-image SiteLogo-image--${size}`}
      >
      <g>
        <rect
          y="1.2581978"
          x="1.2581964"
          height="61.483608"
          width="61.483608"
          style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 4 }}
          />
        <g transform="matrix(0.70980011,0,0,0.52337427,-258.0059,-337.84177)">
          <path
            style={{ fill: 'currentColor' }}
            d="m 408.04,658 c 5.88,14.34 12.3,22.76 16.39,27.42 3.23,3.68 20.94,20.04 0.53,45.61 12.12,-25.04 7.76,-39.88 -13.92,-49.03 v 53 c 0.68,21.83 -21.75,23.16 -27.21,17.35 -5.65,-5.99 7.67,-25.89 24.21,-19.35 z"
            />
        </g>
      </g>
    </svg>
  );

  const linkClasses = classNames({
    'SiteLogo-link': true,
    'SiteLogo-link--readonly': readonly
  });

  const homeUrl = readonly ? null : urls.getHomeUrl();

  return (
    <div className="SiteLogo">
      <a href={homeUrl} className={linkClasses}>
        {renderImage()}
        <span className={`SiteLogo-text SiteLogo-text--${size}`}>Open Music Academy</span>
      </a>
    </div>
  );
}

SiteLogo.propTypes = {
  readonly: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'normal'])
};

SiteLogo.defaultProps = {
  readonly: false,
  size: 'normal'
};

export default SiteLogo;
