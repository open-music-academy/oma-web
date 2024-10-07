import gulp from 'gulp';
import { deleteAsync } from 'del';
import Graceful from 'node-graceful';
import { promises as fs } from 'node:fs';
import realFavicon from 'gulp-real-favicon';
import {
  cliArgs,
  esbuild,
  eslint,
  getEnvAsString,
  less,
  LoadBalancedNodeProcessGroup,
  MaildevContainer,
  MinioContainer,
  MongoContainer,
  NodeProcess,
  TunnelProxyContainer
} from '@educandu/dev-tools';

let currentApp = null;
let isInWatchMode = false;
let currentCdnProxy = null;
let currentAppBuildContext = null;

process.env.NODE_ENV ||= 'development';

const omaEnv = {
  OMA_APP_ROOT_URL: 'http://localhost:3000',
  OMA_WEB_CONNECTION_STRING: 'mongodb://root:rootpw@localhost:27017/dev-educandu-db?replicaSet=educandurs&authSource=admin',
  OMA_CDN_ENDPOINT: 'http://localhost:9000',
  OMA_CDN_REGION: 'eu-central-1',
  OMA_CDN_ACCESS_KEY: 'UVDXF41PYEAX0PXD8826',
  OMA_CDN_SECRET_KEY: 'SXtajmM3uahrQ1ALECh3Z3iKT76s2s5GBJlbQMZx',
  OMA_CDN_BUCKET_NAME: 'dev-educandu-cdn',
  OMA_CDN_ROOT_URL: 'http://localhost:9000/dev-educandu-cdn',
  OMA_ALLOWED_LICENSES: 'CC0-1.0,CC-BY-4.0,CC-BY-SA-4.0,CC-BY-NC-4.0,CC-BY-NC-SA-4.0,CC-BY-ND-4.0,CC-BY-NC-ND-4.0,MIT',
  OMA_SESSION_SECRET: 'd4340515fa834498b3ab1aba1e4d9013',
  OMA_SESSION_COOKIE_DOMAIN: 'localhost',
  OMA_SESSION_COOKIE_NAME: 'SESSION_ID_OMA_LOCAL',
  OMA_CONSENT_COOKIE_NAME_PREFIX: 'CONSENT_OMA_LOCAL',
  OMA_UPLOAD_LIABILITY_COOKIE_NAME: 'UPLOAD_LIABILITY_OMA_LOCAL',
  OMA_ANNOUNCEMENT_COOKIE_NAME_PREFIX: 'ANNOUNCEMENT_OMA_LOCAL',
  OMA_X_ROOMS_AUTH_SECRET: 'F3BCBB69EC8442E79AE3D0EA9647AA96',
  OMA_EMAIL_SENDER_ADDRESS: 'educandu-test-app@test.com',
  OMA_SMTP_OPTIONS: 'smtp://127.0.0.1:8025/?ignoreTLS=true',
  OMA_INITIAL_USER: JSON.stringify({ displayName: 'test', password: 'test', email: 'test@test.com' }),
  OMA_EXPOSE_ERROR_DETAILS: true.toString(),
  OMA_SKIP_MAINTENANCE: false.toString(),
  OMA_AMB_API_KEY: 'ABEE12673E7044D89F5D908893BABE77',
  OMA_SAML_AUTH_DECRYPTION: process.env.TUNNEL_WEBSITE_SAML_AUTH_DECRYPTION || '',
  OMA_SAML_IDENTITY_PROVIDER_KEYS: 'hfmutm, hfmn, samltest',
  OMA_TRUST_PROXY: true.toString()
};

const mongoContainer = new MongoContainer({
  port: 27017,
  rootUser: 'root',
  rootPassword: 'rootpw',
  replicaSetName: 'educandurs'
});

const minioContainer = new MinioContainer({
  port: 9000,
  accessKey: 'UVDXF41PYEAX0PXD8826',
  secretKey: 'SXtajmM3uahrQ1ALECh3Z3iKT76s2s5GBJlbQMZx',
  initialBuckets: ['dev-educandu-cdn']
});

const maildevContainer = new MaildevContainer({
  smtpPort: 8025,
  frontendPort: 8000
});

Graceful.on('exit', async () => {
  await currentAppBuildContext?.dispose();
  await currentApp?.waitForExit();
  await currentCdnProxy?.waitForExit();
});

export async function clean() {
  await deleteAsync(['dist']);
}

export async function lint() {
  await eslint.lint(['*.js', 'src/**/*.js'], { failOnError: !isInWatchMode });
}

export async function fix() {
  await eslint.fix(['*.js', 'src/**/*.js']);
}

export async function buildCss() {
  await less.compile({
    inputFile: './src/main.less',
    outputFile: './dist/main.css',
    optimize: true
  });
}

export async function buildJs() {
  if (currentAppBuildContext) {
    await currentAppBuildContext.rebuild();
  } else {
    // eslint-disable-next-line require-atomic-updates
    currentAppBuildContext = await esbuild.bundle({
      entryPoints: ['./src/main.js'],
      outdir: './dist',
      minify: true,
      incremental: isInWatchMode,
      inject: ['./src/polyfills.js'],
      metaFilePath: './dist/meta.json'
    });
  }
}

export const build = gulp.parallel(buildJs, buildCss);

export function faviconGenerate(done) {
  realFavicon.generateFavicon({
    masterPicture: 'favicon.png',
    dest: 'static',
    iconsPath: '/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '14%',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        },
        appName: 'Open Music Academy'
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#2b5797',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        },
        appName: 'Open Music Academy'
      },
      androidChrome: {
        pictureAspect: 'backgroundAndMargin',
        margin: '17%',
        backgroundColor: '#ffffff',
        themeColor: '#ffffff',
        manifest: {
          name: 'Open Music Academy',
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'blackAndWhite',
        threshold: 71.09375,
        themeColor: '#5bbad5'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: true,
      readmeFile: false,
      htmlCodeFile: false,
      usePathAsIs: false
    },
    versioning: {
      paramName: 'v',
      paramValue: 'cakfaagbe'
    },
    markupFile: 'favicon-data.json'
  }, async () => {
    const faviconData = await fs.readFile('favicon-data.json', 'utf8');
    const faviconDataPrettified = JSON.stringify(JSON.parse(faviconData), null, 2);
    await fs.writeFile('favicon-data.json', faviconDataPrettified, 'utf8');
    done();
  });
}

export async function faviconCheckUpdate(done) {
  const faviconData = await ('favicon-data.json', 'utf8');
  const currentVersion = JSON.parse(faviconData).version;
  realFavicon.checkForUpdates(currentVersion, done);
}

export async function maildevUp() {
  await maildevContainer.ensureIsRunning();
}

export async function maildevDown() {
  await maildevContainer.ensureIsRemoved();
}

export async function mongoUp() {
  await mongoContainer.ensureIsRunning();
}

export async function mongoDown() {
  await mongoContainer.ensureIsRemoved();
}

export async function minioUp() {
  await minioContainer.ensureIsRunning();
}

export async function minioDown() {
  await minioContainer.ensureIsRemoved();
}

export async function startServer() {
  const { instances, tunnel } = cliArgs;

  const tunnelToken = tunnel ? getEnvAsString('TUNNEL_TOKEN') : null;
  const tunnelWebsiteDomain = tunnel ? getEnvAsString('TUNNEL_WEBSITE_DOMAIN') : null;
  const tunnelWebsiteCdnDomain = tunnel ? getEnvAsString('TUNNEL_WEBSITE_CDN_DOMAIN') : null;

  if (tunnel) {
    // eslint-disable-next-line no-console
    console.log('Opening tunnel connections');
    const websiteTunnel = new TunnelProxyContainer({
      name: 'oma-web-tunnel',
      tunnelToken,
      tunnelDomain: tunnelWebsiteDomain,
      localPort: 3000
    });

    const websiteCdnTunnel = new TunnelProxyContainer({
      name: 'oma-web-cdn-tunnel',
      tunnelToken,
      tunnelDomain: tunnelWebsiteCdnDomain,
      localPort: 10000
    });

    await Promise.all([
      websiteTunnel.ensureIsRunning(),
      websiteCdnTunnel.ensureIsRunning()
    ]);

    Graceful.on('exit', async () => {
      // eslint-disable-next-line no-console
      console.log('Closing tunnel connections');
      await Promise.all([
        websiteTunnel.ensureIsRemoved(),
        websiteCdnTunnel.ensureIsRemoved()
      ]);
    });
  }

  const finalOmaEnv = {
    NODE_ENV: process.env.NODE_ENV,
    ...omaEnv,
    OMA_CDN_ROOT_URL: tunnel ? `https://${tunnelWebsiteCdnDomain}` : 'http://localhost:10000',
    OMA_SESSION_COOKIE_DOMAIN: tunnel ? tunnelWebsiteDomain : omaEnv.OMA_SESSION_COOKIE_DOMAIN,
    OMA_SAML_AUTH_DECRYPTION: tunnel ? omaEnv.OMA_SAML_AUTH_DECRYPTION : '',
    OMA_SAML_IDENTITY_PROVIDER_KEYS: tunnel ? omaEnv.OMA_SAML_IDENTITY_PROVIDER_KEYS : ''
  };

  currentCdnProxy = new NodeProcess({
    script: 'node_modules/@educandu/rooms-auth-lambda/src/dev-server/run.js',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: 10000,
      WEBSITE_BASE_URL: tunnel ? `https://${tunnelWebsiteDomain}` : 'http://localhost:3000',
      CDN_BASE_URL: 'http://localhost:9000/dev-educandu-cdn',
      SESSION_COOKIE_NAME: omaEnv.OMA_SESSION_COOKIE_DOMAIN,
      X_ROOMS_AUTH_SECRET: omaEnv.OMA_X_ROOMS_AUTH_SECRET
    }
  });

  if (instances > 1) {
    currentApp = new LoadBalancedNodeProcessGroup({
      script: 'src/index.js',
      jsx: true,
      loadBalancerPort: 3000,
      getNodeProcessPort: index => 4000 + index,
      instanceCount: cliArgs.instances,
      getInstanceEnv: index => ({
        ...finalOmaEnv,
        OMA_PORT: (4000 + index).toString()
      })
    });
  } else {
    currentApp = new NodeProcess({
      script: 'src/index.js',
      jsx: true,
      env: {
        ...finalOmaEnv,
        OMA_PORT: (3000).toString()
      }
    });
  }

  await Promise.all([
    currentCdnProxy.start(),
    currentApp.start()
  ]);
}

export async function restartServer() {
  await currentApp.restart({
    OMA_SKIP_MAINTENANCE: true.toString()
  });
}

export const up = gulp.parallel(mongoUp, minioUp, maildevUp);

export const down = gulp.parallel(mongoDown, minioDown, maildevDown);

export const serve = gulp.series(gulp.parallel(up, build), startServer);

export const verify = gulp.series(lint, build);

export function setupWatchMode(done) {
  isInWatchMode = true;
  done();
}

export function startWatchers(done) {
  gulp.watch(['src/**/*.{js,json}'], gulp.series(buildJs, restartServer));
  gulp.watch(['src/**/*.less'], buildCss);
  done();
}

export const watch = gulp.series(setupWatchMode, serve, startWatchers);

export default watch;
