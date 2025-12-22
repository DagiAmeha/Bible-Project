import { createServer, Server as HTTPServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocket } from "./lib/socket-server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

console.log("Starting Next.js app...");
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log("Preparing app...");
app
  .prepare()
  .then(() => {
    console.log("App prepared, creating server...");
    const httpServer: HTTPServer = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url || "", true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });

    console.log("Initializing Socket.IO...");
    // Initialize Socket.IO
    initSocket(httpServer);

    console.log(`Listening on port ${port}...`);
    httpServer.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log("> Socket.IO initialized");
    });
  })
  .catch((err) => {
    console.error("Error preparing app:", err);
  });
