import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function SiteLogo({ inverted }) {
  return (
    <div className={classNames('SiteLogo', { 'SiteLogo--inverted': inverted })}>Open Music Academy</div>
  );
}

SiteLogo.propTypes = {
  inverted: PropTypes.bool
};

SiteLogo.defaultProps = {
  inverted: false
};

export default SiteLogo;
