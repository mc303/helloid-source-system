import React from "react";
import { Admin, Resource } from "react-admin";
import dataProvider from "./dataProvider";
import { CssBaseline, AppBar, Toolbar, Typography, Box } from "@mui/material";
import { ContractList, ContractEdit, ContractCreate } from "./resources/contracts";
import { DepartmentList, DepartmentEdit, DepartmentCreate } from "./resources/departments";

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
  return (
    <Admin
      dataProvider={dataProvider}
      layout={MyLayout}
      disableTelemetry
    >
      <Resource
        name="contracts"
        list={ContractList}
        edit={ContractEdit}
        create={ContractCreate}
      />
      <Resource
        name="departments"
        list={DepartmentList}
        edit={DepartmentEdit}
        create={DepartmentCreate}
      />
    </Admin>
  );
};

export default App;