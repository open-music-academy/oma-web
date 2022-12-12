import PropTypes from 'prop-types';
import SiteLogo from './site-logo.js';
import React, { useState } from 'react';
import PageHeader from './page-header.js';
import PageFooter from './page-footer.js';
import { useTranslation } from 'react-i18next';
import HomePageIllustration from './home-page-illustration.js';
import Markdown from '@educandu/educandu/components/markdown.js';
import ConsentDrawer from '@educandu/educandu/components/consent-drawer.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import UiLanguageDialog from '@educandu/educandu/components/ui-language-dialog.js';

function HomePageTemplate({ children }) {
  const settings = useSettings();
  const { t } = useTranslation('oma');
  const [isUiLanguageDialogVisible, setIsUiLanguageDialogVisible] = useState(false);

  const handleUiLanguageDialogClose = () => {
    setIsUiLanguageDialogVisible(false);
  };

  const handleUiLanguageClick = () => {
    setIsUiLanguageDialogVisible(true);
  };

  return (
    <div className="HomePageTemplate">
      <PageHeader onUiLanguageClick={handleUiLanguageClick} />
      <main className="HomePageTemplate-contentArea">
        <div className="HomePageTemplate-content">
          <div className="HomePageTemplate-logo" >
            <SiteLogo readonly />
            <div className="HomePageTemplate-subtitle">{t('homePage.subtitle')}</div>
          </div>
          <div>
            {children}
            {!!settings.homepageInfo && (
            <div className="HomePageTemplate-info"><Markdown renderMedia>{settings.homepageInfo}</Markdown></div>
            )}
          </div>
          <div className="HomePageTemplate-illustration">
            <HomePageIllustration />
          </div>
        </div>
      </main>
      <PageFooter />
      <UiLanguageDialog visible={isUiLanguageDialogVisible} onClose={handleUiLanguageDialogClose} />
      <ConsentDrawer />
    </div>
  );
}

HomePageTemplate.propTypes = {
  children: PropTypes.node
};

HomePageTemplate.defaultProps = {
  children: null
};

export default HomePageTemplate;
