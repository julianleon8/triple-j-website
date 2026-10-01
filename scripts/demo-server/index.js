// Entry point: `pnpm demo:backend` (or `node scripts/demo-server/index.js`).
// PORT=54321 by default. POST /__reset restores the seed without a restart.
const { createMockSupabase } = require("./engine");
const seed = require("./seed");

createMockSupabase({
  seed: seed.build,
  scope: seed.scope,
  relations: seed.relations,
  rpc: seed.rpc,
  port: Number(process.env.PORT || 54321),
}).start();
