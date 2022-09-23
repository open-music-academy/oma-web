import url from 'url';
import path from 'path';
import parseBool from 'parseboolean';
import educandu from '@educandu/educandu';
import faviconData from '../favicon-data.json';
import bundleConfig from './bundles/bundle-config.js';

// eslint-disable-next-line no-process-env
const processEnv = process.env;

const thisDir = path.dirname(url.fileURLToPath(import.meta.url));

const disabledPlugins = (processEnv.OMA_DISABLED_PLUGINS || '').split(',').map(x => x.trim()).filter(x => x);

const enabledPlugins = [
  'markdown',
  'audio',
  'video',
  'image',
  'catalog',
  'annotation',
  'table',
  'pdf-viewer',
  'diagram-net',
  'iframe',
  'abc-notation',
  'quick-tester',
  'ear-training',
  'interval-trainer',
  'media-slideshow',
  'interactive-media',
  'multitrack-media',
  'media-analysis',
  'anavis'
].filter(plugin => !disabledPlugins.includes(plugin));

const config = {
  appName: 'Open Music Academy',
  bundleConfig,
  port: Number(processEnv.OMA_PORT) || 3000,
  publicFolders: ['../dist', '../static'].map(x => path.resolve(thisDir, x)),
  resources: ['./src/local-resources.json', './src/resource-overrides.json'].map(x => path.resolve(x)),
  sessionDurationInMinutes: Number(processEnv.OMA_SESSION_DURATION_IN_MINUTES) || 60,
  skipMaintenance: parseBool(processEnv.OMA_SKIP_MAINTENANCE || false.toString()),
  mongoConnectionString: processEnv.OMA_WEB_CONNECTION_STRING,
  cdnEndpoint: processEnv.OMA_CDN_ENDPOINT,
  cdnRegion: processEnv.OMA_CDN_REGION,
  cdnAccessKey: processEnv.OMA_CDN_ACCESS_KEY,
  cdnSecretKey: processEnv.OMA_CDN_SECRET_KEY,
  cdnBucketName: processEnv.OMA_CDN_BUCKET_NAME,
  cdnRootUrl: processEnv.OMA_CDN_ROOT_URL,
  sessionSecret: processEnv.OMA_SESSION_SECRET,
  sessionCookieDomain: processEnv.OMA_SESSION_COOKIE_DOMAIN,
  sessionCookieName: processEnv.OMA_SESSION_COOKIE_NAME,
  consentCookieNamePrefix: processEnv.OMA_CONSENT_COOKIE_NAME_PREFIX,
  uploadLiabilityCookieName: processEnv.OMA_UPLOAD_LIABILITY_COOKIE_NAME,
  emailSenderAddress: processEnv.OMA_EMAIL_SENDER_ADDRESS,
  smtpOptions: processEnv.OMA_SMTP_OPTIONS,
  initialUser: processEnv.OMA_INITIAL_USER ? JSON.parse(processEnv.OMA_INITIAL_USER) : null,
  exposeErrorDetails: parseBool(processEnv.OMA_EXPOSE_ERROR_DETAILS || false.toString()),
  exportApiKey: processEnv.OMA_EXPORT_API_KEY,
  importSources: JSON.parse(processEnv.OMA_IMPORT_SOURCES || '[]'),
  taskProcessing: {
    isEnabled: true,
    idlePollIntervalInMs: 10000,
    maxAttempts: 3
  },
  additionalControllers: [],
  additionalHeadHtml: faviconData.favicon.html_code,
  areRoomsEnabled: parseBool(processEnv.OMA_ARE_ROOMS_ENABLED || false.toString()),
  disabledFeatures: JSON.parse(processEnv.OMA_DISABLED_FEATURES || '[]'),
  plugins: enabledPlugins,
  basicAuthUsers: JSON.parse(processEnv.OMA_BASIC_AUTH_USERS || '{}'),
  ambConfig: {
    apiKey: processEnv.OMA_AMB_API_KEY,
    publisher: [
      {
        type: 'Organization',
        name: 'Open Music Academy'
      }

    ],
    about: [
      {
        id: 'https://w3id.org/kim/hochschulfaechersystematik/n78'
      }
    ],
    image: './images/oma-amb-logo.png'
  }
};

educandu(config);
