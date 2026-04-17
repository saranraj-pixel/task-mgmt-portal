import * as Sentry from "@sentry/react";

export const logError = (error, context = {}) => {
  // Send to Sentry
  Sentry.captureException(error, {
    extra: context,
  });

  // Keep console for dev
  if (import.meta.env.DEV_PRODUCTION_URL) {
    console.error(error, context);
  }
};
