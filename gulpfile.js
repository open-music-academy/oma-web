/* eslint-disable no-console, no-process-env, require-atomic-updates */
import del from 'del';
import gulp from 'gulp';
import glob from 'glob';
import { EOL } from 'os';
import fse from 'fs-extra';
import less from 'gulp-less';
import csso from 'gulp-csso';
import gulpif from 'gulp-if';
import esbuild from 'esbuild';
import eslint from 'gulp-eslint';
import { promisify } from 'util';
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

const MINIO_ACCESS_KEY = 'UVDXF41PYEAX0PXD8826';
const MINIO_SECRET_KEY = 'SXtajmM3uahrQ1ALECh3Z3iKT76s2s5GBJlbQMZx';

const FAVICON_DATA_FILE = 'favicon-data.json';

const optimize = (process.argv[2] || '').startsWith('ci') || process.argv.includes('--optimize');
const verbose = (process.argv[2] || '').startsWith('ci') || process.argv.includes('--verbose');

const bundleTargets = ['esnext', 'chrome95', 'firefox93', 'safari15', 'edge95'];
const autoprefixOptions = { browsers: ['last 2 versions'] };

let server = null;
let buildResult = null;
const containerCommandTimeoutMs = 2000;

Graceful.on('exit', () => {
  server?.kill();
  buildResult?.rebuild?.dispose();
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
      entryPoints: await promisify(glob)('./src/bundles/*.js'),
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
        appName: 'elmu'
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
        appName: 'elmu'
      },
      androidChrome: {
        pictureAspect: 'backgroundAndMargin',
        margin: '17%',
        backgroundColor: '#ffffff',
        themeColor: '#ffffff',
        manifest: {
          name: 'elmu',
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
        ...process.env,
        NODE_ENV: 'development',
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

export default startWatch;
