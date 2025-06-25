import axios from "axios";
import { parseOpenAPI } from "./parseOpenAPI";

// Fetch OpenAPI spec from PostgREST and parse tables/columns/relations
export async function introspectDatabase(apiUrl) {
  // PostgREST exposes /openapi endpoint
  const openapiUrl = apiUrl.replace(/\/$/, "") + "/";

  // Try OpenAPI first
  try {
    const { data } = await axios.get(openapiUrl + "openapi");
    return parseOpenAPI(data);
  } catch (e) {}

  // Fallback: enumerate tables with OPTIONS
  const { data: root } = await axios.get(openapiUrl);
  const tables = Object.keys(root).filter(t => !t.startsWith("_"));
  const schemas = {};
  for (const table of tables) {
    const opts = await axios.options(openapiUrl + table);
    schemas[table] = parseOptions(opts.data, table);
  }
  return { tables, schemas };
}

function parseOptions(options, table) {
  // Fallback minimal parser for OPTIONS output
  // You may need to adjust based on your PostgREST version
  const columns = [];
  const foreignKeys = {};
  if (options && options.fields) {
    for (const [name, field] of Object.entries(options.fields)) {
      columns.push({
        name,
        type: field.type,
        required: field.required,
      });
      if (field.foreign_key && field.foreign_key.table) {
        foreignKeys[name] = {
          refTable: field.foreign_key.table,
          refField: field.foreign_key.column,
        };
      }
    }
  }
  return { columns, foreignKeys };
}