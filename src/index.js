import url from 'url';
import path from 'path';
import parseBool from 'parseboolean';
import educandu from '@educandu/educandu';
import customResolvers from './custom-resolvers.js';
import faviconData from '../favicon-data.json' assert { type: 'json' };

const thisDir = path.dirname(url.fileURLToPath(import.meta.url));

const trustProxy = /^\d+$/.test(process.env.OMA_TRUST_PROXY)
  ? Number.parseInt(process.env.OMA_TRUST_PROXY)
  : parseBool(process.env.OMA_TRUST_PROXY || false.toString())

const getCsv = str => (str || '').split(',').map(x => x.trim()).filter(x => !!x);

const availableIdentityProviders = {
  hfmutm: {
    key: 'hfmutm',
    displayName: 'Hochschule für Musik und Theater München',
    logoUrl: 'https://hmtm.de/wp-content/uploads/logos/hmtm_logo.svg',
    expiryTimeoutInDays: 6 * 30,
    metadata: {
      url: 'https://www.aai.dfn.de/metadata/dfn-aai-idp-metadata.xml',
      entityId: 'https://sso.hmtm.de/idp/shibboleth'
    }
  },
  hfmn: {
    key: 'hfmn',
    displayName: 'Hochschule für Musik Nürnberg',
    logoUrl: 'https://www.hfm-nuernberg.de/fileadmin/templates/images/layout/logo-hfmn.png',
    expiryTimeoutInDays: 6 * 30,
    metadata: {
      url: 'https://www.aai.dfn.de/metadata/dfn-aai-idp-metadata.xml',
      entityId: 'https://sso.hfm-nuernberg.de/idp/shibboleth'
    }
  },
  samltest: {
    key: 'samltest',
    displayName: 'SAMLTEST.ID',
    logoUrl: 'https://samltest.id/wp-content/uploads/2018/08/Logo-2-73x73.png',
    expiryTimeoutInDays: 6 * 30,
    metadata: {
      url: 'https://samltest.id/saml/idp',
      entityId: 'https://samltest.id/saml/idp'
    }
  }
};

const disabledPlugins = getCsv(process.env.OMA_DISABLED_PLUGINS);
const enabledPlugins = [
  'markdown',
  'markdown-with-image',
  'image',
  'catalog',
  'separator',
  'music-accentuation',
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
  'combined-multitrack-media',
  'media-analysis',
  'benewagner/educandu-plugin-piano',
  'text-field',
  'select-field',
  'file-upload-field',
  'whiteboard',
  'benewagner/educandu-plugin-list'
].filter(plugin => !disabledPlugins.includes(plugin));

const jsWithChecksumPathPattern = /\w+-[A-Z0-9]{8}\.js$/;

const config = {
  appName: 'Open Music Academy',
  appRootUrl: process.env.OMA_APP_ROOT_URL,
  port: Number(process.env.OMA_PORT) || 3000,
  trustProxy,
  mongoConnectionString: process.env.OMA_WEB_CONNECTION_STRING,
  skipMaintenance: parseBool(process.env.OMA_SKIP_MAINTENANCE || false.toString()),
  cdnEndpoint: process.env.OMA_CDN_ENDPOINT,
  cdnRegion: process.env.OMA_CDN_REGION,
  cdnAccessKey: process.env.OMA_CDN_ACCESS_KEY,
  cdnSecretKey: process.env.OMA_CDN_SECRET_KEY,
  cdnBucketName: process.env.OMA_CDN_BUCKET_NAME,
  cdnRootUrl: process.env.OMA_CDN_ROOT_URL,
  customResolvers,
  publicFolders: [
    {
      publicPath: '/',
      destination: path.resolve(thisDir, '../dist'),
      setHeaders: (res, requestPath) => {
        const maxAge = jsWithChecksumPathPattern.test(requestPath) ? 604800 : 0;
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
      }
    },
    {
      publicPath: '/',
      destination: path.resolve(thisDir, '../static')
    }
  ],
  resources: [
    './resources.json',
    '../node_modules/@benewagner/educandu-plugin-piano/dist/translations.json',
    '../node_modules/@benewagner/educandu-plugin-list/dist/translations.json'
  ].map(x => path.resolve(thisDir, x)),
  themeFile: path.resolve(thisDir, './theme.less'),
  allowedLicenses: getCsv(process.env.OMA_ALLOWED_LICENSES),
  additionalControllers: [],
  additionalHeadHtml: faviconData.favicon.html_code,
  sessionSecret: process.env.OMA_SESSION_SECRET,
  sessionCookieDomain: process.env.OMA_SESSION_COOKIE_DOMAIN,
  sessionCookieName: process.env.OMA_SESSION_COOKIE_NAME,
  sessionCookieSecure: parseBool(process.env.OMA_SESSION_COOKIE_SECURE || false.toString()),
  sessionDurationInMinutes: Number(process.env.OMA_SESSION_DURATION_IN_MINUTES) || 60,
  consentCookieNamePrefix: process.env.OMA_CONSENT_COOKIE_NAME_PREFIX,
  uploadLiabilityCookieName: process.env.OMA_UPLOAD_LIABILITY_COOKIE_NAME,
  announcementCookieNamePrefix: process.env.OMA_ANNOUNCEMENT_COOKIE_NAME_PREFIX,
  xFrameOptions: process.env.OMA_X_FRAME_OPTIONS || null,
  xRoomsAuthSecret: process.env.OMA_X_ROOMS_AUTH_SECRET || null,
  smtpOptions: process.env.OMA_SMTP_OPTIONS,
  emailSenderAddress: process.env.OMA_EMAIL_SENDER_ADDRESS,
  adminEmailAddress: process.env.OMA_ADMIN_EMAIL_ADDRESS || null,
  initialUser: process.env.OMA_INITIAL_USER ? JSON.parse(process.env.OMA_INITIAL_USER) : null,
  basicAuthUsers: JSON.parse(process.env.OMA_BASIC_AUTH_USERS || '{}'),
  plugins: enabledPlugins,
  disabledFeatures: getCsv(process.env.OMA_DISABLED_FEATURES),
  disableScheduling: parseBool(process.env.OMA_DISABLE_SCHEDULING || false.toString()),
  exposeErrorDetails: parseBool(process.env.OMA_EXPOSE_ERROR_DETAILS || false.toString()),
  ambConfig: {
    apiKey: process.env.OMA_AMB_API_KEY,
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
    image: './images/oma-amb-hero-logo.png'
  },
  samlAuth: process.env.OMA_SAML_AUTH_DECRYPTION ? {
    decryption: JSON.parse(process.env.OMA_SAML_AUTH_DECRYPTION),
    identityProviders: getCsv(process.env.OMA_SAML_IDENTITY_PROVIDER_KEYS)
      .map(key => availableIdentityProviders[key.trim()])
      .filter(provider => !!provider)
  } : null
};

educandu(config);
