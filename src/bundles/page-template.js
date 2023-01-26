import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { useState } from 'react';
import PageHeader from './page-header.js';
import PageFooter from './page-footer.js';
import Alert from '@educandu/educandu/components/alert.js';
import ConsentDialog from '@educandu/educandu/components/consent-dialog.js';
import UiLanguageDialog from '@educandu/educandu/components/ui-language-dialog.js';

function PageTemplate({ children, fullScreen, alerts }) {
  const [isUiLanguageDialogOpen, setIsUiLanguageDialogOpen] = useState(false);

  const handleUiLanguageDialogClose = () => {
    setIsUiLanguageDialogOpen(false);
  };

  const handleUiLanguageClick = () => {
    setIsUiLanguageDialogOpen(true);
  };

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
      <Alert
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
      <PageHeader onUiLanguageClick={handleUiLanguageClick} />
      <main className={contentAreaClasses}>
        <div className={contentClasses}>
          {!!alerts?.length && <div className="PageTemplate-contentAlerts">{alerts.map(renderAlert)}</div>}
          {children}
        </div>
      </main>
      <PageFooter />
      <UiLanguageDialog isOpen={isUiLanguageDialogOpen} onClose={handleUiLanguageDialogClose} />
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
  fullScreen: PropTypes.bool
};

PageTemplate.defaultProps = {
  alerts: [],
  children: null,
  fullScreen: false
};

export default PageTemplate;
