import postgrestRestProvider from "@raphiniert/ra-data-postgrest";
import config from "./config";
const apiUrl = config.apiUrl;

const baseDataProvider = postgrestRestProvider(apiUrl, {});

const wrappedDataProvider = {};

// Iterate over the methods of the base dataProvider and wrap them
// to ensure that any error is caught and re-rejected as a Promise.
for (const method in baseDataProvider) {
    if (typeof baseDataProvider[method] === 'function') {
        wrappedDataProvider[method] = (...args) => {
            return baseDataProvider[method](...args).catch(error => {
                console.error(`Error in dataProvider method "${method}":`, error);
                // Ensure the error is a proper Error object if it's not already
                const err = error instanceof Error ? error : new Error(error.message || String(error));
                return Promise.reject(err);
            });
        };
    } else {
        // Copy non-function properties directly (e.g., if it exposes apiUrl directly)
        wrappedDataProvider[method] = baseDataProvider[method];
    }
}

export default wrappedDataProvider;