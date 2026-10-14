import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestHandler } from '@react-router/express';

// Lambda Web Functions passes the listen address via AWS_LAMBDA_HTTP_ENDPOINT
// (host:port). Fall back to 0.0.0.0:3000 for local runs.
const [HOST, PORT_STRING] = (process.env.AWS_LAMBDA_HTTP_ENDPOINT ?? '0.0.0.0:3000').split(':');
const HOSTNAME = HOST || '0.0.0.0';
const PORT = Number.parseInt(PORT_STRING || process.env.PORT || '3000', 10);

// Module-relative paths so the layout works both in the repo (server/server.js)
// and in the Lambda Web Functions .zip (server/ + build/ + public/ preserved).
const BUILD_URL = new URL('../build/server/index.js', import.meta.url);
const CLIENT_DIR = fileURLToPath(new URL('../build/client', import.meta.url));
const PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));

// Short-circuit the type-checking of the built output.
const build = await import(BUILD_URL.href);

const app = express();

app.use(compression());
app.disable('x-powered-by');

const publicPath = build.publicPath ?? '/';
const expressPublicPath = publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
const assetsBuildDirectory = path.isAbsolute(build.assetsBuildDirectory ?? '')
  ? build.assetsBuildDirectory
  : CLIENT_DIR;

app.use(
  path.posix.join(expressPublicPath, 'assets'),
  express.static(path.join(assetsBuildDirectory, 'assets'), { immutable: true, maxAge: '1y' }),
);
app.use(expressPublicPath, express.static(assetsBuildDirectory, { maxAge: '1h' }));
app.use(express.static(PUBLIC_DIR, { maxAge: '1h' }));

app.use(morgan('tiny'));

app.all('/{*splat}', createRequestHandler({ build, mode: process.env.NODE_ENV }));

app.listen(PORT, HOSTNAME, () => {
  console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});
