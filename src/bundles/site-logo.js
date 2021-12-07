import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import urls from '@educandu/educandu/utils/urls.js';

function SiteLogo({ readonly, size }) {
  const classes = classNames({
    'SiteLogo': true,
    'SiteLogo--readonly': readonly,
    'SiteLogo--normal': size === 'normal'
  });

  return readonly
    ? <span className={classes}>Open Music Academy</span>
    : <a className={classes} href={urls.getHomeUrl()}>Open Music Academy</a>;
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
