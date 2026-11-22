"use strict";

/**
 * Error con contexto-machine y contexto-humano.
 * `code` permite filtrar/buscar en logs y `step` dice exactamente dónde falló.
 */
class ActionError extends Error {
  constructor({ code, step, message, details = {}, cause } = {}) {
    super(message || code || "Action failed");
    this.name = "ActionError";
    this.code = code || "UNKNOWN_ERROR";
    this.step = step || "unknown";
    this.details = details;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }

  toJSON() {
    return {
      code: this.code,
      step: this.step,
      message: this.message,
      details: this.details,
      cause: this.cause ? String(this.cause.message || this.cause) : undefined,
    };
  }
}

/** Convierte cualquier error en ActionError sin perder el original como `cause`. */
function wrapError(error, options = {}) {
  if (error instanceof ActionError) {
    return error;
  }
  const { code = "UNEXPECTED_ERROR", step = "unknown", message, details = {} } = options;
  const reason = error instanceof Error ? error.message : String(error);
  return new ActionError({
    code,
    step,
    message: message || reason,
    details: { ...details, errorType: error instanceof Error ? error.name : typeof error },
    cause: error,
  });
}

/** Mensaje único enviado a core.setFailed(): legible en la UI de GitHub. */
function formatError(error) {
  const failure = error instanceof ActionError ? error : wrapError(error);
  const details = Object.keys(failure.details).length
    ? ` | ${JSON.stringify(failure.details)}`
    : "";
  const cause = failure.cause
    ? ` | cause: ${failure.cause.message || failure.cause}`
    : "";
  return `[${failure.code}@${failure.step}] ${failure.message}${details}${cause}`;
}

module.exports = { ActionError, wrapError, formatError };
