import PropTypes from 'prop-types';
import SiteLogo from './site-logo.js';
import React, { useState } from 'react';
import PageHeader from './page-header.js';
import PageFooter from './page-footer.js';
import HomePageIllustration from './home-page-illustration.js';
import Markdown from '@educandu/educandu/components/markdown.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import UiLanguageDialog from '@educandu/educandu/components/ui-language-dialog.js';
import CookieConsentDrawer from '@educandu/educandu/components/cookie-consent-drawer.js';

function HomePageTemplate({ children, alerts }) {
  const settings = useSettings();
  const [isUiLanguageDialogVisible, setIsUiLanguageDialogVisible] = useState(false);

  const handleUiLanguageDialogClose = () => {
    setIsUiLanguageDialogVisible(false);
  };

  const handleUiLanguageClick = () => {
    setIsUiLanguageDialogVisible(true);
  };

  return (
    <div className="PageTemplate">
      <PageHeader fullScreen alerts={alerts} onUiLanguageClick={handleUiLanguageClick} />
      <main className="PageTemplate-contentArea PageTemplate-contentArea--fullScreen">
        <div className="PageTemplate-content PageTemplate-content--fullScreen PageTemplate-content--aboveCenter">
          <div className="HomePageTemplate-logo" >
            <HomePageIllustration />
            <SiteLogo readonly />
          </div>
          {children}
          {settings.homepageInfo && (
            <div className="HomePageTemplate-info">
              <Markdown renderMedia>{settings.homepageInfo}</Markdown>
            </div>
          )}
        </div>
      </main>
      <PageFooter />
      <UiLanguageDialog visible={isUiLanguageDialogVisible} onClose={handleUiLanguageDialogClose} />
      <CookieConsentDrawer />
    </div>
  );
}

HomePageTemplate.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.node.isRequired,
    type: PropTypes.oneOf(['success', 'info', 'warning', 'error'])
  })),
  children: PropTypes.node
};

HomePageTemplate.defaultProps = {
  alerts: [],
  children: null
};

export default HomePageTemplate;
