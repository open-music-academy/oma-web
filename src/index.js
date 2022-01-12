import url from 'url';
import path from 'path';
import parseBool from 'parseboolean';
import educandu from '@educandu/educandu';
import bundleConfig from './bundles/bundle-config.js';
import ArticlesController from './articles-controller.js';

// eslint-disable-next-line no-process-env
const processEnv = process.env;

const thisDir = path.dirname(url.fileURLToPath(import.meta.url));

const config = {
  bundleConfig,
  port: Number(processEnv.OMA_PORT) || 3000,
  publicFolders: ['../dist', '../static'].map(x => path.resolve(thisDir, x)),
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
  additionalControllers: [ArticlesController],
  areRoomsEnabled: parseBool(processEnv.OMA_ARE_ROOMS_ENABLED || false.toString())
};

educandu(config);
