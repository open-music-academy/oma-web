import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PageHeader from './page-header.js';
import CustomAlert from '@educandu/educandu/components/custom-alert.js';
import ConsentDialog from '@educandu/educandu/components/consent-dialog.js';
import DefaultPageFooter from '@educandu/educandu/components/default-page-footer.js';

function PageTemplate({ children, fullScreen, focusHeader, alerts, headerRef, contentRef }) {
  const contentAreaClasses = classNames({
    'PageTemplate-contentArea': true,
    'PageTemplate-contentArea--fullScreen': fullScreen
  });
  const contentClasses = classNames({
    'PageTemplate-content': true,
    'PageTemplate-content--fullScreen': fullScreen
  });

  const renderAlert = (alert, index) => {
    const shouldRenderAlert = !fullScreen || alert.showInFullScreen;

    if (!shouldRenderAlert) {
      return null;
    }

    return (
      <CustomAlert
        banner
        key={index}
        type={alert.type}
        message={alert.message}
        closable={alert.closable || false}
        onClose={alert.onClose || (() => { })}
        />
    );
  };

  return (
    <div className="PageTemplate">
      <PageHeader focusContent={focusHeader} headerRef={headerRef} />
      <main className={contentAreaClasses}>
        <div className={contentClasses} ref={contentRef}>
          {!!alerts?.length && <div className="PageTemplate-contentAlerts">{alerts.map(renderAlert)}</div>}
          {children}
        </div>
      </main>
      {!focusHeader && <DefaultPageFooter />}
      <ConsentDialog />
    </div>
  );
}

PageTemplate.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.node.isRequired,
    closable: PropTypes.bool,
    onClose: PropTypes.func
  })),
  children: PropTypes.node,
  fullScreen: PropTypes.bool,
  focusHeader: PropTypes.node,
  headerRef: PropTypes.object,
  contentRef: PropTypes.object
};

PageTemplate.defaultProps = {
  alerts: [],
  children: null,
  fullScreen: false,
  focusHeader: null,
  headerRef: null,
  contentRef: null
};

export default PageTemplate;
