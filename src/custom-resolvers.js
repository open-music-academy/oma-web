import SiteLogo from './custom-components/site-logo.js';
import PageTemplate from './custom-components/page-template.js';
import EducanduPluginList from '@benewagner/educandu-plugin-list';
import EducanduPluginPiano from '@benewagner/educandu-plugin-piano';
import HomepageTemplate from './custom-components/homepage-template.js';
import EducanduPluginProgressionModels from '@musikisum/educandu-plugin-progression-models';

export default {
  resolveCustomPageTemplate: () => PageTemplate,
  resolveCustomHomePageTemplate: () => HomepageTemplate,
  resolveCustomSiteLogo: () => SiteLogo,
  resolveCustomPluginInfos: () => [EducanduPluginPiano, EducanduPluginList, EducanduPluginProgressionModels]
};
