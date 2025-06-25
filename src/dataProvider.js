import postgrestRestProvider from "ra-data-postgrest";
import config from "./config";
const apiUrl = config.apiUrl;
export default postgrestRestProvider(apiUrl, {});