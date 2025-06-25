import React, { useEffect, useState } from "react";
import { Admin } from "react-admin";
import dataProvider from "./dataProvider";
import { introspectDatabase } from "./schema/introspect";
import { DynamicResources } from "./dynamic/DynamicResources";
import { CssBaseline, AppBar, Toolbar, Typography, Box } from "@mui/material";
import config from "./config";

// Fixed header bar
const MyAppBar = () => (
  <AppBar position="sticky" sx={{ zIndex: 1201, minHeight: 56 }}>
    <Toolbar variant="dense">
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        PostgREST Dynamic Admin
      </Typography>
    </Toolbar>
  </AppBar>
);

const MyLayout = ({ children }) => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <CssBaseline />
    <MyAppBar />
    <Box sx={{ flex: 1, overflow: "auto", background: "#f8f9fa", px: 2, py: 2, minHeight: 0 }}>
      {children}
    </Box>
  </Box>
);

const App = () => {
  const [tables, setTables] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    introspectDatabase(config.apiUrl)
      .then(({ tables, schemas }) => {
        setTables(tables);
        setSchemas(schemas);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load schema from PostgREST. " + err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading schema...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // Pass schemas to config for use in dynamic fields
  const mergedConfig = { ...config, schemas };

  return (
    <Admin
      dataProvider={dataProvider}
      layout={MyLayout}
      disableTelemetry
    >
      <DynamicResources tables={tables} schemas={schemas} config={mergedConfig} />
    </Admin>
  );
};

export default App;