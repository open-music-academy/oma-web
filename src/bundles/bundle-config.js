import SiteLogo from './site-logo.js';
import PageTemplate from './page-template.js';
import HomepageTemplate from './homepage-template.js';

export default {
  getPageTemplateComponent() {
    return PageTemplate;
  },
  getHomePageTemplateComponent() {
    return HomepageTemplate;
  },
  getSiteLogoComponent() {
    return SiteLogo;
  }
};
