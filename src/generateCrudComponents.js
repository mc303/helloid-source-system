import React from 'react';
import {
  List, Datagrid, TextField, ReferenceField,
  Edit, SimpleForm, TextInput, ReferenceInput, SelectInput,
  Create, Show, SimpleShowLayout
} from 'react-admin';

export function generateCrudComponents(table, schema) {
  // schema = { columns: [...], foreignKeys: {...} }
  
  function renderFields(fields, mode = 'view') {
    return fields.map(field => {
      if (field.isForeignKey && schema.foreignKeys[field.name]) {
        const ref = schema.foreignKeys[field.name].table;
        const refField = schema.foreignKeys[field.name].refField || 'name';
        if (mode === 'view') {
          return <ReferenceField key={field.name} source={field.name} reference={ref}><TextField source={refField} /></ReferenceField>;
        } else {
          return <ReferenceInput key={field.name} source={field.name} reference={ref}><SelectInput optionText={refField} /></ReferenceInput>;
        }
      }
      if (mode === 'view') {
        return <TextField key={field.name} source={field.name} />;
      } else {
        return <TextInput key={field.name} source={field.name} />;
      }
    });
  }

  const list = props => (
    <List {...props}>
      <Datagrid rowClick="edit">
        {renderFields(schema.columns, 'view')}
      </Datagrid>
    </List>
  );

  const edit = props => (
    <Edit {...props}>
      <SimpleForm>
        {renderFields(schema.columns, 'edit')}
      </SimpleForm>
    </Edit>
  );

  const create = props => (
    <Create {...props}>
      <SimpleForm>
        {renderFields(schema.columns, 'edit')}
      </SimpleForm>
    </Create>
  );

  const show = props => (
    <Show {...props}>
      <SimpleShowLayout>
        {renderFields(schema.columns, 'view')}
      </SimpleShowLayout>
    </Show>
  );

  return { list, edit, create, show };
}