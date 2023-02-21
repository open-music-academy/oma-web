import React from 'react';
import PropTypes from 'prop-types';
import SiteLogo from './site-logo.js';
import PageHeader from './page-header.js';
import { useTranslation } from 'react-i18next';
import ConsentDialog from '@educandu/educandu/components/consent-dialog.js';
import DefaultPageFooter from '@educandu/educandu/components/default-page-footer.js';

function HomePageTemplate({ children }) {
  const { t } = useTranslation('oma');

  return (
    <div className="HomePageTemplate">
      <PageHeader />
      <main className="HomePageTemplate-contentArea">
        <div className="HomePageTemplate-content">
          <div className="HomePageTemplate-pictogramSearch">
            <img src="/images/pictogram-search.svg" />
          </div>
          <div className="HomePageTemplate-logo" >
            <SiteLogo readonly />
            <div className="HomePageTemplate-subtitle">{t('homePage.subtitle')}</div>
          </div>
          <div>
            {children}
          </div>
        </div>
      </main>
      <div className="HomePageTemplate-sponsorsFooter">
        {t('homePage.supportedBy')}
        <div className="HomePageTemplate-sponsors">
          <a className="HomePageTemplate-sponsor" href="https://stiftung-hochschullehre.de/" target="_blank" rel="noreferrer">
            <img src="/images/sih-logo.svg" />
          </a>
          <a className="HomePageTemplate-sponsor" href="https://www.hmtm.de/de/" target="_blank" rel="noreferrer">
            <img src="/images/hmtm-logo.svg" />
          </a>
        </div>
      </div>
      <DefaultPageFooter />
      <ConsentDialog />
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
