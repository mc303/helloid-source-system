import React from "react";
import { Resource } from "react-admin";
import { makeResourceCrud } from "./fields";

// Dynamically generate all Resource components
export function DynamicResources({ tables, schemas, config }) {
  return tables.map(table => {
    const tableConfig = config?.overrides?.[table] || {};
    const label = tableConfig.label || table;
    const { List, Edit, Create } = makeResourceCrud(table, schemas[table], config);
    return (
      <Resource
        key={table}
        name={table}
        list={List}
        edit={Edit}
        create={Create}
        options={{ label }}
      />
    );
  });
}