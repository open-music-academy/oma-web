import SiteLogo from './custom-components/site-logo.js';
import PageTemplate from './custom-components/page-template.js';
import EducanduPluginList from '@benewagner/educandu-plugin-list';
import EducanduPluginPiano from '@benewagner/educandu-plugin-piano';
import HomepageTemplate from './custom-components/homepage-template.js';
import EducanduPluginFlipbook from '@musikisum/educandu-plugin-flipbook';
import EducanduPluginGapGenius from '@musikisum/educandu-plugin-gap-genius';
import EducanduPluginEmbeddedHtml from '@musikisum/educandu-plugin-embedded-html';
import EducanduPluginMusicMapping from '@benewagner/educandu-plugin-music-mapping';
import EducanduPluginPitchAnalyzer from '@musikisum/educandu-plugin-pitch-analyzer';
import EducanduPluginProgressionModels from '@musikisum/educandu-plugin-progression-models';
import EducanduPluginOrchestrationAssistant from '@musikisum/educandu-plugin-orchestration-assistant';

export default {
  resolveCustomPageTemplate: () => PageTemplate,
  resolveCustomHomePageTemplate: () => HomepageTemplate,
  resolveCustomSiteLogo: () => SiteLogo,
  resolveCustomPluginInfos: () => [
    EducanduPluginPiano,
    EducanduPluginList,
    EducanduPluginMusicMapping,
    EducanduPluginProgressionModels,
    EducanduPluginGapGenius,
    EducanduPluginOrchestrationAssistant,
    EducanduPluginPitchAnalyzer,
    EducanduPluginEmbeddedHtml,
    EducanduPluginFlipbook
  ]
};
