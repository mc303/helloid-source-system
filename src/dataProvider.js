import postgrestRestProvider from "@raphiniert/ra-data-postgrest";
import config from "./config";
const apiUrl = config.apiUrl;

const baseDataProvider = postgrestRestProvider(apiUrl, {
    primaryKeys: new Map([
        ['contracts', ['contract_id']],
        ['departments', ['external_id']]
    ])
});

const wrappedDataProvider = {};

// Iterate over the methods of the base dataProvider and wrap them
// to ensure that any error is caught and re-rejected as a Promise.
for (const method in baseDataProvider) {
    if (typeof baseDataProvider[method] === 'function') {
        wrappedDataProvider[method] = (...args) => {
            // Wrap in a new promise chain to catch both synchronous errors and asynchronous rejections
            return Promise.resolve()
                .then(() => baseDataProvider[method].apply(baseDataProvider, args))
                .catch(error => {
                    console.error(`Error in dataProvider method "${method}":`, error);
                    const err = error instanceof Error ? error : new Error(error.message || String(error));
                    return Promise.reject(err);
                });
        };
    } else {
        // Use getters for non-function properties to ensure correct access
        Object.defineProperty(wrappedDataProvider, method, {
            get: () => baseDataProvider[method],
            enumerable: true // Make the property visible during iteration
        });
    }
}

export default wrappedDataProvider;