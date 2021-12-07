import SiteLogo from './site-logo.js';
import PageTemplate from './page-template.js';

export default {
  getPageTemplateComponent() {
    return PageTemplate;
  },
  getSiteLogoComponent() {
    return SiteLogo;
  }
};
