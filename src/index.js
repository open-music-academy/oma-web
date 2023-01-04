import url from 'url';
import path from 'path';
import parseBool from 'parseboolean';
import educandu from '@educandu/educandu';
import bundleConfig from './bundles/bundle-config.js';
import faviconData from '../favicon-data.json' assert { type: 'json' };

// eslint-disable-next-line no-process-env
const processEnv = process.env;

const thisDir = path.dirname(url.fileURLToPath(import.meta.url));

const trustProxy = /^\d+$/.test(processEnv.OMA_TRUST_PROXY)
  ? Number.parseInt(processEnv.OMA_TRUST_PROXY)
  : parseBool(processEnv.OMA_TRUST_PROXY || false.toString())

const disabledPlugins = (processEnv.OMA_DISABLED_PLUGINS || '').split(',').map(x => x.trim()).filter(x => x);

const enabledPlugins = [
  'markdown',
  'markdown-with-image',
  'image',
  'catalog',
  'annotation',
  'audio',
  'video',
  'table',
  'pdf-viewer',
  'table-of-contents',
  'matching-cards',
  'diagram-net',
  'iframe',
  'abc-notation',
  'music-xml-viewer',
  'quick-tester',
  'ear-training',
  'audio-waveform',
  'media-slideshow',
  'interactive-media',
  'multitrack-media',
  'media-analysis'
].filter(plugin => !disabledPlugins.includes(plugin));

const config = {
  appName: 'Open Music Academy',
  port: Number(processEnv.OMA_PORT) || 3000,
  trustProxy,
  mongoConnectionString: processEnv.OMA_WEB_CONNECTION_STRING,
  skipMaintenance: parseBool(processEnv.OMA_SKIP_MAINTENANCE || false.toString()),
  cdnEndpoint: processEnv.OMA_CDN_ENDPOINT,
  cdnRegion: processEnv.OMA_CDN_REGION,
  cdnAccessKey: processEnv.OMA_CDN_ACCESS_KEY,
  cdnSecretKey: processEnv.OMA_CDN_SECRET_KEY,
  cdnBucketName: processEnv.OMA_CDN_BUCKET_NAME,
  cdnRootUrl: processEnv.OMA_CDN_ROOT_URL,
  bundleConfig,
  publicFolders: ['../dist', '../static'].map(x => path.resolve(thisDir, x)),
  resources: ['./src/local-resources.json', './src/resource-overrides.json'].map(x => path.resolve(x)),
  themeFile: path.resolve('./src/theme.less'),
  additionalControllers: [],
  additionalHeadHtml: faviconData.favicon.html_code,
  sessionSecret: processEnv.OMA_SESSION_SECRET,
  sessionCookieDomain: processEnv.OMA_SESSION_COOKIE_DOMAIN,
  sessionCookieName: processEnv.OMA_SESSION_COOKIE_NAME,
  sessionCookieSecure: parseBool(processEnv.OMA_SESSION_COOKIE_SECURE || false.toString()),
  sessionDurationInMinutes: Number(processEnv.OMA_SESSION_DURATION_IN_MINUTES) || 60,
  consentCookieNamePrefix: processEnv.OMA_CONSENT_COOKIE_NAME_PREFIX,
  uploadLiabilityCookieName: processEnv.OMA_UPLOAD_LIABILITY_COOKIE_NAME,
  xFrameOptions: processEnv.OMA_X_FRAME_OPTIONS || null,
  xRoomsAuthSecret: processEnv.OMA_X_ROOMS_AUTH_SECRET || null,
  smtpOptions: processEnv.OMA_SMTP_OPTIONS,
  emailSenderAddress: processEnv.OMA_EMAIL_SENDER_ADDRESS,
  adminEmailAddress: processEnv.OMA_ADMIN_EMAIL_ADDRESS || null,
  initialUser: processEnv.OMA_INITIAL_USER ? JSON.parse(processEnv.OMA_INITIAL_USER) : null,
  basicAuthUsers: JSON.parse(processEnv.OMA_BASIC_AUTH_USERS || '{}'),
  plugins: enabledPlugins,
  disabledFeatures: JSON.parse(processEnv.OMA_DISABLED_FEATURES || '[]'),
  exposeErrorDetails: parseBool(processEnv.OMA_EXPOSE_ERROR_DETAILS || false.toString()),
  taskProcessing: {
    isEnabled: true,
    idlePollIntervalInMs: 10000,
    maxAttempts: 3
  },
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
  },
  externalAccountProviders: JSON.parse(processEnv.OMA_EXTERNAL_ACCOUNT_PROVIDERS || '[]')
};

educandu(config);
