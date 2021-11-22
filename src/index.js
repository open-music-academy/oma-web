import url from 'url';
import path from 'path';
import parseBool from 'parseboolean';
import educandu from '@educandu/educandu';

// eslint-disable-next-line no-process-env
const processEnv = process.env;

const thisDir = path.dirname(url.fileURLToPath(import.meta.url));

const config = {
  port: Number(processEnv.OMA_PORT) || 3000,
  publicFolders: ['../dist', '../static'].map(x => path.resolve(thisDir, x)),
  sessionDurationInMinutes: Number(processEnv.OMA_SESSION_DURATION_IN_MINUTES) || 60,
  skipMongoMigrations: parseBool(processEnv.OMA_SKIP_DB_MIGRATIONS || false.toString()),
  skipMongoChecks: parseBool(processEnv.OMA_SKIP_DB_CHECKS || false.toString()),
  mongoConnectionString: processEnv.OMA_WEB_CONNECTION_STRING,
  cdnEndpoint: processEnv.OMA_CDN_ENDPOINT,
  cdnRegion: processEnv.OMA_CDN_REGION,
  cdnAccessKey: processEnv.OMA_CDN_ACCESS_KEY,
  cdnSecretKey: processEnv.OMA_CDN_SECRET_KEY,
  cdnBucketName: processEnv.OMA_CDN_BUCKET_NAME,
  cdnRootUrl: processEnv.OMA_CDN_ROOT_URL,
  sessionSecret: processEnv.OMA_SESSION_SECRET,
  emailSenderAddress: processEnv.OMA_EMAIL_SENDER_ADDRESS,
  smtpOptions: processEnv.OMA_SMTP_OPTIONS,
  // eslint-disable-next-line no-undefined
  initialUser: processEnv.OMA_INITIAL_USER ? JSON.parse(processEnv.OMA_INITIAL_USER) : undefined,
  exposeErrorDetails: parseBool(processEnv.OMA_EXPOSE_ERROR_DETAILS || false.toString()),
  exportApiKey: processEnv.OMA_EXPORT_API_KEY,
  importSources: JSON.parse(processEnv.OMA_IMPORT_SOURCES || '[]')
};

educandu(config);
