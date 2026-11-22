"use strict";

const PREFIX = "translate-readme";

function formatContext(context) {
  return context && Object.keys(context).length ? ` ${JSON.stringify(context)}` : "";
}

/** Logger con prefijo y trazas por paso, inyectable en los tests. */
function createLogger(sink = console) {
  const log = typeof sink.log === "function" ? sink.log.bind(sink) : () => {};
  const errorLog = typeof sink.error === "function" ? sink.error.bind(sink) : log;

  return {
    info(message, context) {
      log(`[${PREFIX}] ${message}${formatContext(context)}`);
    },
    step(step, message, context) {
      log(`[${PREFIX}:${step}] ${message}${formatContext(context)}`);
    },
    error(message, context) {
      errorLog(`[${PREFIX}:error] ${message}${formatContext(context)}`);
    },
  };
}

module.exports = { createLogger, formatContext };
