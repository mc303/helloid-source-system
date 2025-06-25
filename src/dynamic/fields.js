import React, { useState } from "react";
import {
  List, Datagrid, TextField, ReferenceField, EditButton, DeleteButton,
  Edit, SimpleForm, TextInput, ReferenceInput, SelectInput,
  Create, TopToolbar, ExportButton
} from "react-admin";
import { Box } from "@mui/material";
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
  return (
    <TopToolbar>
      <Box sx={{ width: "100%", px: 2, pt: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <TextInput
            label=""
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            source="q"
          />
          <button onClick={onSearch} style={{marginLeft: 8}}>Search</button>
          <button onClick={onAdvanced} style={{marginLeft: 4}}>Advanced</button>
        </Box>
      </Box>
      <ExportButton />
    </TopToolbar>
  );
}

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
    <Edit {...props} resource={table}>
      <SimpleForm>
        {schema.columns.map(col => {
          const hide = config?.overrides?.[table]?.edit?.hide?.includes(col.name);
          if (hide) return null;
          if (schema.foreignKeys[col.name]) {
            const refTable = schema.foreignKeys[col.name].refTable;
            const refField = pickReferenceField(refTable, schemas, config);
            return (
              <ReferenceInput key={col.name} source={col.name} reference={refTable} label={col.name}>
                <SelectInput optionText={refField} />
              </ReferenceInput>
            );
          }
          return <TextInput key={col.name} source={col.name} label={col.name} />;
        })}
      </SimpleForm>
    </Edit>
  );

  // Create
  const CreateComponent = props => (
    <Create {...props} resource={table}>
      <SimpleForm>
        {schema.columns.map(col => {
          const hide = config?.overrides?.[table]?.create?.hide?.includes(col.name);
          if (hide) return null;
          if (schema.foreignKeys[col.name]) {
            const refTable = schema.foreignKeys[col.name].refTable;
            const refField = pickReferenceField(refTable, schemas, config);
            return (
              <ReferenceInput key={col.name} source={col.name} reference={refTable} label={col.name}>
                <SelectInput optionText={refField} />
              </ReferenceInput>
            );
          }
          return <TextInput key={col.name} source={col.name} label={col.name} />;
        })}
      </SimpleForm>
    </Create>
  );

  // Attach schemas for reference field helpers
  ListComponent.defaultProps = { schemas };
  EditComponent.defaultProps = { schemas };
  CreateComponent.defaultProps = { schemas };

  return { List: ListComponent, Edit: EditComponent, Create: CreateComponent };
}