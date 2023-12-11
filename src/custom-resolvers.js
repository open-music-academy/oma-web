import SiteLogo from './custom-components/site-logo.js';
import PageTemplate from './custom-components/page-template.js';
import HomepageTemplate from './custom-components/homepage-template.js';

export default {
  resolveCustomPageTemplate: () => PageTemplate,
  resolveCustomHomePageTemplate: () => HomepageTemplate,
  resolveCustomSiteLogo: () => SiteLogo,
  resolveCustomPluginInfos: () => []
};
