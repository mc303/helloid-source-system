// Parses PostgREST OpenAPI spec into table/column/relationship metadata
export function parseOpenAPI(openapi) {
  const tables = [];
  const schemas = {};
  const paths = openapi.paths || {};
  for (const path in paths) {
    // Match only /table
    const m = path.match(/^\/([^\/]+)$/);
    if (!m) continue;
    const table = m[1];
    tables.push(table);
    const schema = { columns: [], foreignKeys: {} };
    const props = (((paths[path] || {})["post"] || {}).requestBody || {})
      .content?.["application/json"]?.schema?.properties
      || (((paths[path] || {})["get"] || {}).parameters || []).reduce((acc, p) => {
        if (p.schema?.type) acc[p.name] = p.schema;
        return acc;
      }, {});
    for (const [name, def] of Object.entries(props)) {
      schema.columns.push({
        name,
        type: def.format || def.type,
        required: (def.nullable === false),
      });
    }
    // Foreign keys from x-relations
    const rels = openapi?.components?.schemas?.[table]?.["x-relations"] || [];
    for (const rel of rels) {
      if (rel.type === "many-to-one" && rel.references?.length) {
        for (const fk of rel.references) {
          schema.foreignKeys[fk.local] = {
            refTable: fk.foreignTable,
            refField: fk.foreignColumn,
          };
        }
      }
    }
    schemas[table] = schema;
  }
  return { tables, schemas };
}