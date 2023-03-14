import React from 'react';
import PropTypes from 'prop-types';
import SiteLogo from './site-logo.js';
import PageHeader from './page-header.js';
import HeaderLogo from './header-logo.js';
import { useTranslation } from 'react-i18next';
import ConsentDialog from '@educandu/educandu/components/consent-dialog.js';
import DefaultPageFooter from '@educandu/educandu/components/default-page-footer.js';
import HomepageTrustFooter from '@educandu/educandu/components/homepage/homepage-trust-footer.js';
import HomepageDocumentCards from '@educandu/educandu/components/homepage/homepage-document-cards.js';
import HomepageOerPresentation from '@educandu/educandu/components/homepage/homepage-oer-presentation.js';
import HomepageProjectPresentation from '@educandu/educandu/components/homepage/homepage-project-presentation.js';

function HomepageTemplate({ children }) {
  const { t } = useTranslation('oma');

  return (
    <div className="HomepageTemplate">
      <main className="HomepageTemplate-main">
        <section className="HomepageTemplate-aboveFold">
          <PageHeader />
          <div className="HomepageTemplate-aboveFoldContentWrapper">
            <div className="HomepageTemplate-aboveFoldContent">
              <div className="HomepageTemplate-logo" >
                <SiteLogo inverted />
                <div className="HomepageTemplate-subtitle">{t('homepage.subtitle')}</div>
              </div>
              <div className="HomepageTemplate-children">
                {children}
              </div>
            </div>
          </div>
        </section>
        <section className="HomepageTemplate-underFold">
          <div className="HomepageTemplate-underFoldStripe HomepageTemplate-underFoldStripe--documents">
            <div className="HomepageTemplate-underFoldStripeContent">
              <HomepageDocumentCards />
            </div>
          </div>
          <div className="HomepageTemplate-underFoldStripe HomepageTemplate-underFoldStripe--project">
            <div className="HomepageTemplate-underFoldStripeContent">
              <HomepageProjectPresentation logo={<HeaderLogo width={300} />} />
            </div>
          </div>
          <div className="HomepageTemplate-underFoldStripe HomepageTemplate-underFoldStripe--oer">
            <div className="HomepageTemplate-underFoldStripeContent">
              <HomepageOerPresentation />
            </div>
          </div>
        </section>
        <HomepageTrustFooter />
      </main>
      <DefaultPageFooter />
      <ConsentDialog />
    </div>
  );
}

HomepageTemplate.propTypes = {
  children: PropTypes.node
};

HomepageTemplate.defaultProps = {
  children: null
};

export default HomepageTemplate;
