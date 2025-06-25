import { useEffect, useState } from 'react';

export function useSchema() {
  const [tables, setTables] = useState([]);
  const [schemas, setSchemas] = useState({});
  useEffect(() => {
    fetch('http://db-hid-source:3000/')
      .then(res => res.json())
      .then(meta => {
        const tableNames = Object.keys(meta).filter(name => !name.startsWith('_'));
        setTables(tableNames);
        return Promise.all(
          tableNames.map(table =>
            fetch(`http://db-hid-source:3000/${table}`, { method: 'OPTIONS' })
              .then(res => res.json())
              .then(options => ({ [table]: parseOptions(options) }))
          )
        );
      })
      .then(schemasArr => {
        setSchemas(Object.assign({}, ...schemasArr));
      });
  }, []);
  return { tables, schemas };
}

function parseOptions(options) {
  // Extract columns, foreign keys, etc. from OPTIONS response
  // Implementation depends on actual PostgREST output
  // ...
}