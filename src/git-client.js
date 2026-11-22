"use strict";

// simple-git v3 exportaba una función; v4 exporta { simpleGit }.
// Este adaptador evita que un cambio de versión rompa el action en producción.
const simpleGitModule = require("simple-git");

function resolveFactory(module) {
  const factory = typeof module === "function" ? module : module && module.simpleGit;

  if (typeof factory !== "function") {
    throw new TypeError("simple-git no expone una fábrica de cliente compatible");
  }

  return factory;
}

function createGitClient(options) {
  return resolveFactory(simpleGitModule)(options);
}

module.exports = { createGitClient, resolveFactory };
