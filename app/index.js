// Lambda Web Functions entrypoint.
// The runtime loads index.js at the package root by default.
// Re-export the Express server which reads AWS_LAMBDA_HTTP_ENDPOINT itself.
import './server/server.js';
