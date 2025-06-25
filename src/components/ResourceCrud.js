import React, { useState } from "react";
import {
    List, Datagrid, TextField, EditButton, DeleteButton,
    Edit, SimpleForm, TextInput, Create,
    TopToolbar, Button, ExportButton, useListContext
} from "react-admin";
import { columns } from "../columns";
import SearchBar from "./SearchBar";
import { Box } from "@mui/material";

// List actions with search
const ListActions = ({ resource, onSearch, onAdvanced, search, setSearch }) => (
    <TopToolbar>
        <Box sx={{ width: "100%", px: 2, pt: 1 }}>
            <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={onSearch}
                onAdvanced={onAdvanced}
            />
        </Box>
        <ExportButton />
    </TopToolbar>
);

export const ResourceList = ({ resource }) => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({});

    const handleSearch = () => {
        setFilter(search ? { q: search } : {});
    };

    const handleAdvanced = () => {
        alert("Advanced Search is not implemented yet.");
    };

    return (
        <List
            resource={resource}
            perPage={25}
            filters={filter}
            actions={
                <ListActions
                    resource={resource}
                    onSearch={handleSearch}
                    onAdvanced={handleAdvanced}
                    search={search}
                    setSearch={setSearch}
                />
            }
        >
            <Datagrid bulkActionButtons={false} sx={{ fontSize: "0.92rem" }}>
                {columns[resource].map(col => (
                    <TextField key={col.source} source={col.source} label={col.label} />
                ))}
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};

export const ResourceEdit = ({ resource }) => (
    <Edit resource={resource}>
        <SimpleForm>
            {columns[resource].map(col => (
                <TextInput key={col.source} source={col.source} label={col.label} />
            ))}
        </SimpleForm>
    </Edit>
);

export const ResourceCreate = ({ resource }) => (
    <Create resource={resource}>
        <SimpleForm>
            {columns[resource].map(col => (
                <TextInput key={col.source} source={col.source} label={col.label} />
            ))}
        </SimpleForm>
    </Create>
);