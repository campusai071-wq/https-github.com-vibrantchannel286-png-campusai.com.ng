import React, { lazy, ComponentType } from 'react';

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (retries > 0) {
            setTimeout(() => {
              importFn()
                .then(resolve)
                .catch((retryErr) => {
                  if (retries - 1 === 0) {
                    if (!sessionStorage.getItem('chunk_reload')) {
                      sessionStorage.setItem('chunk_reload', 'true');
                      window.location.reload();
                    } else {
                      sessionStorage.removeItem('chunk_reload');
                      reject(retryErr);
                    }
                  } else {
                    // Retry recursively
                    lazyWithRetry(importFn, retries - 1, interval * 2);
                  }
                });
            }, interval);
          } else {
            reject(error);
          }
        });
    });
  });
}
