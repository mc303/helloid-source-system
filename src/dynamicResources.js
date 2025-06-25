import { Resource } from 'react-admin';
import { generateCrudComponents } from './generateCrudComponents';

export function DynamicResources({ tables, schemas }) {
  return tables.map(table => {
    const { list, edit, create, show } = generateCrudComponents(table, schemas[table]);
    return (
      <Resource
        key={table}
        name={table}
        list={list}
        edit={edit}
        create={create}
        show={show}
      />
    );
  });
}