#!/usr/bin/env node
"use strict";

const { run } = require("./src/runner");

if (require.main === module) {
  // `run()` ya reporta el error con core.setFailed(); este catch es sólo una red de seguridad.
  run().catch((error) => {
    console.error("[translate-readme] fatal error", error);
    process.exitCode = 1;
  });
}

module.exports = { run };
