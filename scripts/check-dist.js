#!/usr/bin/env node
"use strict";

const { createHash } = require("crypto");
const { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } = require("fs");
const { tmpdir } = require("os");
const { join, relative } = require("path");
const { spawnSync } = require("child_process");

const root = join(__dirname, "..");
const dist = join(root, "dist");
const temp = mkdtempSync(join(tmpdir(), "translate-readme-dist-"));

function snapshot(dir) {
  const files = [];
  function walk(current) {
    for (const entry of readdirSync(current).sort()) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else {
        const content = readFileSync(full);
        files.push({
          path: relative(dir, full),
          sha256: createHash("sha256").update(content).digest("hex"),
        });
      }
    }
  }
  walk(dir);
  return files;
}

try {
  cpSync(dist, join(temp, "dist"), { recursive: true });

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const build = spawnSync(npm, ["run", "build"], { cwd: root, stdio: "inherit" });
  if (build.status !== 0) {
    process.exit(build.status || 1);
  }

  const before = snapshot(join(temp, "dist"));
  const after = snapshot(dist);

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    console.error(
      "[check:dist] dist/ está desactualizado. Ejecuta `npm run build` y commitea el resultado: " +
        "GitHub Actions ejecuta dist/index.js, no index.js.",
    );
    process.exit(1);
  }

  console.log("[check:dist] dist/ coincide con el código fuente.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
