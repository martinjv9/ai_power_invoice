import "dotenv/config"; // load apps/api/.env before anything reads process.env
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
