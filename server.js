import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import https from 'https';
import fs from 'fs';

installGlobals();

// Add SSL certificate configuration
const sslOptions = {
	key: fs.readFileSync('./certs/key.pem'),
	cert: fs.readFileSync('./certs/cert.pem')
};

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

const port = process.env.PORT || 443;
const host = process.env.HOST || 'ecommerce.com.np';

// Create HTTPS server instead of HTTP
const server = https.createServer(sslOptions, app).listen(port, host, () =>
	console.log(`Express server listening at https://${host}:${port}`),
);

const viteDevServer =
	process.env.NODE_ENV === "production"
		? undefined
		: await import("vite").then((vite) =>
      vite.createServer({
        server: {
          middlewareMode: true,
          hmr: {
            server: server,
          },
        },
      }),
    );

// handle asset requests
if (viteDevServer) {
	app.use(viteDevServer.middlewares);
} else {
	// Vite fingerprints its assets so we can cache forever.
	app.use(
		"/assets",
		express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
	);
}

// Create a request handler for Remix
const remixHandler = createRequestHandler({
	build: viteDevServer
			? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
			: () => import("./build/server/index.js"),
});

// handle SSR requests
app.all("*", remixHandler);