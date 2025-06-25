import React, { useState } from "react";
import {
  List, Datagrid, TextField, ReferenceField, EditButton, DeleteButton,
  Edit, SimpleForm, TextInput, ReferenceInput, SelectInput,
  Create, TopToolbar, ExportButton
} from "react-admin";
import { Box, Button } from "@mui/material";
import AdvancedSearchDialog from "../components/AdvancedSearchDialog";

// Helper to pick display field for reference (e.g. name, display_name)
function pickReferenceField(refTable, schemas, config) {
  if (config?.overrides?.[refTable]?.referenceField)
    return config.overrides[refTable].referenceField;
  const possible = ["display_name", "name", "code", "id", "external_id"];
  const fields = schemas?.[refTable]?.columns?.map(f => f.name) || [];
  for (const candidate of possible) {
    if (fields.includes(candidate)) return candidate;
  }
  return config.defaultReferenceField || fields[0] || "id";
}

// Render toolbar with search bar and advanced modal
function ListActions({ resource, onSearch, onAdvanced, search, setSearch }) {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <TopToolbar>
      <Box sx={{ width: "100%", px: 2, pt: 1 }}>
        <Box component="form" onSubmit={handleSearchSubmit} display="flex" alignItems="center" gap={1}>
          <TextInput
            label=""
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            // The source prop is not needed here as we control the state manually
          />
          <Button type="submit" variant="contained" size="small">Search</Button>
          <Button onClick={onAdvanced} size="small">Advanced</Button>
        </Box>
      </Box>
      <ExportButton />
    </TopToolbar>
  );
}

// Reusable form component for Create and Edit views to reduce duplication
const ResourceForm = ({ schema, table, config, view }) => {
  const schemas = config.schemas || {};
  return (
    <SimpleForm>
      {schema.columns.map(col => {
        const hide = config?.overrides?.[table]?.[view]?.hide?.includes(col.name);
        if (hide) return null;
        if (schema.foreignKeys[col.name]) {
          const refTable = schema.foreignKeys[col.name].refTable;
          const refField = pickReferenceField(refTable, schemas, config);
          return <ReferenceInput key={col.name} source={col.name} reference={refTable} label={col.name}><SelectInput optionText={refField} /></ReferenceInput>;
        }
        return <TextInput key={col.name} source={col.name} label={col.name} />;
      })}
    </SimpleForm>
  );
};

// Generate all CRUD components for a resource
export function makeResourceCrud(table, schema, config) {
  const schemas = config.schemas || {};
  // List
  const ListComponent = props => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({});
    const [advancedOpen, setAdvancedOpen] = useState(false);

    const handleSearch = () => {
      setFilter(search ? { q: search } : {});
    };
    return (
      <>
        <List
          {...props}
          resource={table}
          perPage={25}
          filters={filter}
          actions={
            <ListActions
              resource={table}
              onSearch={handleSearch}
              onAdvanced={() => setAdvancedOpen(true)}
              search={search}
              setSearch={setSearch}
            />
          }
        >
          <Datagrid bulkActionButtons={false} sx={{ fontSize: "0.92rem" }}>
            {schema.columns.map(col => {
              // Hide columns if overridden
              const hide = config?.overrides?.[table]?.list?.hide?.includes(col.name);
              if (hide) return null;
              // Reference fields
              if (schema.foreignKeys[col.name]) {
                const refTable = schema.foreignKeys[col.name].refTable;
                const refField = pickReferenceField(refTable, schemas, config);
                return (
                  <ReferenceField
                    key={col.name}
                    source={col.name}
                    reference={refTable}
                    label={col.name}
                  >
                    <TextField source={refField} />
                  </ReferenceField>
                );
              }
              return <TextField key={col.name} source={col.name} label={col.name} />;
            })}
            <EditButton />
            <DeleteButton />
          </Datagrid>
        </List>
        <AdvancedSearchDialog
          open={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          resource={table}
        />
      </>
    );
  };

  // Edit
  const EditComponent = props => (
    <Edit {...props} resource={table} >
      <ResourceForm schema={schema} table={table} config={config} view="edit" />
    </Edit>
  );

  // Create
  const CreateComponent = props => (
    <Create {...props} resource={table}>
      <ResourceForm schema={schema} table={table} config={config} view="create" />
    </Create>
  );

  return { List: ListComponent, Edit: EditComponent, Create: CreateComponent };
}