import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import urls from '@educandu/educandu/utils/urls.js';

function SiteLogo({ readonly, size }) {
  const linkClasses = classNames({
    'SiteLogo-link': true,
    'SiteLogo-link--readonly': readonly
  });

  const homeUrl = readonly ? null : urls.getHomeUrl();

  return (
    <div className="SiteLogo">
      <a href={homeUrl} className={linkClasses}>
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
