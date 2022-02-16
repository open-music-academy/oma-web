import SiteLogo from './site-logo.js';
import PageTemplate from './page-template.js';
import HomePageLogo from './home-page-logo.js';

export default {
  getPageTemplateComponent() {
    return PageTemplate;
  },
  getHomePageLogoComponent() {
    return HomePageLogo;
  },
  getSiteLogoComponent() {
    return SiteLogo;
  }
};
