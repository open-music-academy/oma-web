import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import urls from '@educandu/educandu/utils/urls.js';

function Logo({ readonly, size }) {
  const classes = classNames({
    'Logo': true,
    'Logo--readonly': readonly,
    'Logo--big': size === 'big'
  });

  return readonly
    ? <span className={classes}>Open Music Academy</span>
    : <a className={classes} href={urls.getHomeUrl()}>Open Music Academy</a>;
}

Logo.propTypes = {
  readonly: PropTypes.bool,
  size: PropTypes.oneOf(['default', 'big'])
};

Logo.defaultProps = {
  readonly: false,
  size: 'default'
};

export default Logo;
