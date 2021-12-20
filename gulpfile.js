/* eslint-disable no-console, no-process-env, require-atomic-updates */
import del from 'del';
import gulp from 'gulp';
import { EOL } from 'os';
import fse from 'fs-extra';
import less from 'gulp-less';
import csso from 'gulp-csso';
import gulpif from 'gulp-if';
import esbuild from 'esbuild';
import eslint from 'gulp-eslint';
import plumber from 'gulp-plumber';
import EasyTable from 'easy-table';
import { promises as fs } from 'fs';
import Graceful from 'node-graceful';
import { spawn } from 'child_process';
import { Docker } from 'docker-cli-js';
import prettyBytes from 'pretty-bytes';
import sourcemaps from 'gulp-sourcemaps';
import realFavicon from 'gulp-real-favicon';
import { Client as MinioClient } from 'minio';
import LessAutoprefix from 'less-plugin-autoprefix';

if (process.env.OMA_ENV === 'prod') {
  throw new Error('Tasks should not run in production environment!');
}

const TEST_MAILDEV_IMAGE = 'maildev/maildev:1.1.0';
const TEST_MAILDEV_CONTAINER_NAME = 'maildev';

const TEST_MONGO_IMAGE = 'bitnami/mongodb:4.2.17-debian-10-r23';
const TEST_MONGO_CONTAINER_NAME = 'mongo';

const TEST_MINIO_IMAGE = 'bitnami/minio:2020.12.18';
const TEST_MINIO_CONTAINER_NAME = 'minio';

const TEST_WEBSITE_TUNNEL_IMAGE = 'educandu/inlets:1.0.0';
const TEST_WEBSITE_TUNNEL_CONTAINER_NAME = 'website-tunnel';

const TEST_WEBSITE_CDN_TUNNEL_IMAGE = 'educandu/inlets:1.0.0';
const TEST_WEBSITE_CDN_TUNNEL_CONTAINER_NAME = 'website-cdn-tunnel';

const MINIO_ACCESS_KEY = 'UVDXF41PYEAX0PXD8826';
const MINIO_SECRET_KEY = 'SXtajmM3uahrQ1ALECh3Z3iKT76s2s5GBJlbQMZx';

const FAVICON_DATA_FILE = 'favicon-data.json';

const optimize = (process.argv[2] || '').startsWith('ci') || process.argv.includes('--optimize');
const verbose = (process.argv[2] || '').startsWith('ci') || process.argv.includes('--verbose');

const bundleTargets = ['esnext', 'chrome95', 'firefox93', 'safari15', 'edge95'];
const autoprefixOptions = { browsers: ['last 2 versions'] };

const localEnv = {
  OMA_WEB_CONNECTION_STRING: 'mongodb://root:rootpw@localhost:27017/dev-educandu-db?replicaSet=educandurs&authSource=admin',
  OMA_CDN_ENDPOINT: 'http://localhost:9000',
  OMA_CDN_REGION: 'eu-central-1',
  OMA_CDN_ACCESS_KEY: 'UVDXF41PYEAX0PXD8826',
  OMA_CDN_SECRET_KEY: 'SXtajmM3uahrQ1ALECh3Z3iKT76s2s5GBJlbQMZx',
  OMA_CDN_BUCKET_NAME: 'dev-educandu-cdn',
  OMA_CDN_ROOT_URL: 'http://localhost:9000/dev-educandu-cdn',
  OMA_SESSION_SECRET: 'd4340515fa834498b3ab1aba1e4d9013',
  OMA_EMAIL_SENDER_ADDRESS: 'educandu-test-app@test.com',
  OMA_SMTP_OPTIONS: 'smtp://localhost:8025/?ignoreTLS=true',
  OMA_INITIAL_USER: JSON.stringify({ username: 'test', password: 'test', email: 'test@test.com' }),
  OMA_EXPOSE_ERROR_DETAILS: true.toString()
};

let server = null;
let buildResult = null;
const containerCommandTimeoutMs = 2000;

Graceful.on('exit', () => {
  buildResult?.rebuild?.dispose();
  return new Promise(resolve => {
    if (server) {
      server.once('exit', () => resolve());
    } else {
      resolve();
    }
  });
});

const runDockerCommand = async (command, waitMs = 0) => {
  const result = await new Docker({ echo: false }).command(command);
  await new Promise(resolve => {
    setTimeout(resolve, waitMs);
  });
  return result;
};

const ensureContainerRunning = async ({ containerName, runArgs, afterRun = () => Promise.resolve() }) => {
  const data = await runDockerCommand('ps -a');
  const container = data.containerList.find(c => c.names === containerName);
  if (!container) {
    await runDockerCommand(`run --name ${containerName} ${runArgs}`, containerCommandTimeoutMs);
    await afterRun();
  } else if (!container.status.startsWith('Up')) {
    await runDockerCommand(`restart ${containerName}`, containerCommandTimeoutMs);
  }
};

const ensureContainerRemoved = async ({ containerName }) => {
  try {
    await runDockerCommand(`rm -f ${containerName}`, containerCommandTimeoutMs);
  } catch (err) {
    if (!err.toString().includes('No such container')) {
      throw err;
    }
  }
};

const ensureEnvVar = name => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable '${name}'`);
  }

  return value;
};

export async function clean() {
  await del(['.tmp', 'dist', 'coverage', 'reports']);
}

export function lint() {
  return gulp.src(['*.js', 'src/**/*.js', 'scripts/**/*.js'], { base: './' })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(!server, eslint.failAfterError()));
}

export function fix() {
  return gulp.src(['*.js', 'src/**/*.js', 'scripts/**/*.js'], { base: './' })
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(gulpif(file => file.eslint?.fixed, gulp.dest('./')))
    .pipe(eslint.failAfterError());
}

export function bundleCss() {
  return gulp.src('src/main.less')
    .pipe(gulpif(!!server, plumber()))
    .pipe(sourcemaps.init())
    .pipe(less({ javascriptEnabled: true, plugins: [new LessAutoprefix(autoprefixOptions)] }))
    .pipe(gulpif(optimize, csso()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

export async function bundleJs() {
  if (buildResult && buildResult.rebuild) {
    await buildResult.rebuild();
  } else {
    buildResult = await esbuild.build({
      entryPoints: ['./src/bundles/main.js'],
      target: bundleTargets,
      format: 'esm',
      bundle: true,
      splitting: true,
      incremental: !!server,
      metafile: verbose,
      minify: optimize,
      loader: { '.js': 'jsx' },
      inject: ['./src/polyfills.js'],
      sourcemap: true,
      sourcesContent: true,
      outdir: './dist'
    });
  }

  if (buildResult.metafile) {
    const metatext = await esbuild.analyzeMetafile(buildResult.metafile, { verbose: false });
    await fse.ensureDir('./reports');
    await fs.writeFile('./reports/bundles.txt', metatext, 'utf8');
    await fs.writeFile('./reports/bundles.json', JSON.stringify(buildResult.metafile, null, 2), 'utf8');

    const t = new EasyTable();

    Object.entries(buildResult.metafile.outputs)
      .filter(([key]) => !key.endsWith('.map'))
      .forEach(([key, value]) => {
        t.cell('Bundle', key);
        t.cell('Size', prettyBytes(value.bytes), EasyTable.leftPadder(' '));
        t.newRow();
      });

    console.log(EOL + t.toString());
  }
}

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
      paramValue: 'cakfaagb'
    },
    markupFile: FAVICON_DATA_FILE
  }, async () => {
    const faviconData = await fs.readFile(FAVICON_DATA_FILE, 'utf8');
    const faviconDataPrettified = JSON.stringify(JSON.parse(faviconData), null, 2);
    await fs.writeFile(FAVICON_DATA_FILE, faviconDataPrettified, 'utf8');
    done();
  });
}

export async function ensureBucketExists() {
  const region = 'eu-central-1';
  const bucketName = 'dev-educandu-cdn';

  const minioClient = new MinioClient({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    region,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY
  });

  const bucketPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucketName}/*`
      }
    ]
  };

  const buckets = await minioClient.listBuckets();

  if (!buckets.find(x => x.name === bucketName)) {
    await minioClient.makeBucket(bucketName, region);
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(bucketPolicy));
  }
}

export async function faviconCheckUpdate(done) {
  const faviconData = await fs.readFile(FAVICON_DATA_FILE, 'utf8');
  const currentVersion = JSON.parse(faviconData).version;
  realFavicon.checkForUpdates(currentVersion, done);
}

export const build = gulp.parallel(bundleCss, bundleJs);

export async function maildevUp() {
  await ensureContainerRunning({
    containerName: TEST_MAILDEV_CONTAINER_NAME,
    runArgs: `-d -p 8000:80 -p 8025:25 ${TEST_MAILDEV_IMAGE}`
  });
}

export async function maildevDown() {
  await ensureContainerRemoved({
    containerName: TEST_MAILDEV_CONTAINER_NAME
  });
}

export const maildevReset = gulp.series(maildevDown, maildevUp);

export async function mongoUp() {
  await ensureContainerRunning({
    containerName: TEST_MONGO_CONTAINER_NAME,
    runArgs: [
      '-d',
      '-p 27017:27017',
      '-e MONGODB_ROOT_USER=root',
      '-e MONGODB_ROOT_PASSWORD=rootpw',
      '-e MONGODB_REPLICA_SET_KEY=educandurs',
      '-e MONGODB_REPLICA_SET_NAME=educandurs',
      '-e MONGODB_REPLICA_SET_MODE=primary',
      '-e MONGODB_ADVERTISED_HOSTNAME=localhost',
      TEST_MONGO_IMAGE
    ].join(' ')
  });
}

export async function mongoDown() {
  await ensureContainerRemoved({
    containerName: TEST_MONGO_CONTAINER_NAME
  });
}

export const mongoReset = gulp.series(mongoDown, mongoUp);

export async function minioUp() {
  await ensureContainerRunning({
    containerName: TEST_MINIO_CONTAINER_NAME,
    runArgs: [
      '-d',
      '-p 9000:9000',
      `-e MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}`,
      `-e MINIO_SECRET_KEY=${MINIO_SECRET_KEY}`,
      '-e MINIO_BROWSER=on',
      TEST_MINIO_IMAGE
    ].join(' '),
    afterRun: ensureBucketExists
  });
}

export async function minioDown() {
  await ensureContainerRemoved({
    containerName: TEST_MINIO_CONTAINER_NAME
  });
}

export const minioReset = gulp.series(minioDown, minioUp);

function spawnServer({ skipDbChecks }) {
  server = spawn(
    process.execPath,
    [
      '--experimental-json-modules',
      '--experimental-loader',
      '@educandu/node-jsx-loader',
      '--enable-source-maps',
      'src/index.js'
    ],
    {
      env: {
        NODE_ENV: 'development',
        ...localEnv,
        ...process.env,
        OMA_SKIP_DB_MIGRATIONS: (!!skipDbChecks).toString(),
        OMA_SKIP_DB_CHECKS: (!!skipDbChecks).toString()
      },
      stdio: 'inherit'
    }
  );
  server.once('exit', () => {
    server = null;
  });
}

export function startServer(done) {
  spawnServer({ skipDbChecks: false });
  done();
}

export function restartServer(done) {
  if (server) {
    server.once('exit', () => {
      spawnServer({ skipDbChecks: true });
      done();
    });
    server.kill();
  } else {
    spawnServer({ skipDbChecks: false });
    done();
  }
}

export const up = gulp.series(mongoUp, minioUp, maildevUp);

export const down = gulp.parallel(mongoDown, minioDown, maildevDown);

export const serve = gulp.series(gulp.parallel(up, build), startServer);

export const ci = gulp.series(clean, lint, build);

export function setupWatchers(done) {
  gulp.watch(['src/**/*.{js,json}'], gulp.series(bundleJs, restartServer));
  gulp.watch(['src/**/*.less'], bundleCss);
  done();
}

export const startWatch = gulp.series(serve, setupWatchers);

export async function prepareTunnel() {
  const tunnelToken = ensureEnvVar('TUNNEL_TOKEN');
  const tunnelWebsiteDomain = ensureEnvVar('TUNNEL_WEBSITE_DOMAIN');
  const tunnelWebsiteCdnDomain = ensureEnvVar('TUNNEL_WEBSITE_CDN_DOMAIN');

  localEnv.OMA_CDN_ROOT_URL = `https://${tunnelWebsiteCdnDomain}/dev-educandu-cdn`;

  const getRunArgs = ({ image, websiteDomain, port }) => {
    const runArgs = [
      '-d',
      image,
      'client',
      `--token ${tunnelToken}`,
      `--url=wss://${websiteDomain}`
    ];
    if (process.platform === 'darwin') {
      runArgs.push(`--upstream=http://host.docker.internal:${port}`);
    } else {
      runArgs.push('--net host', `--upstream=http://localhost:${port}`);
    }
    return runArgs.join(' ');
  };

  console.log('Opening tunnel connections');
  await ensureContainerRunning({
    containerName: TEST_WEBSITE_TUNNEL_CONTAINER_NAME,
    runArgs: getRunArgs({ image: TEST_WEBSITE_TUNNEL_IMAGE, websiteDomain: tunnelWebsiteDomain, port: 3000 })
  });
  await ensureContainerRunning({
    containerName: TEST_WEBSITE_CDN_TUNNEL_CONTAINER_NAME,
    runArgs: getRunArgs({ image: TEST_WEBSITE_CDN_TUNNEL_IMAGE, websiteDomain: tunnelWebsiteCdnDomain, port: 9000 })
  });

  Graceful.on('exit', async () => {
    console.log('Closing tunnel connections');
    await Promise.all([
      ensureContainerRemoved({ containerName: TEST_WEBSITE_TUNNEL_CONTAINER_NAME }),
      ensureContainerRemoved({ containerName: TEST_WEBSITE_CDN_TUNNEL_CONTAINER_NAME })
    ]);
  });
}

export const tunnel = gulp.series(prepareTunnel, startWatch);

export default startWatch;
