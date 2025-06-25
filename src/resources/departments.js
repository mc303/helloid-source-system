import React from 'react';
import {
    List, Datagrid, TextField, EditButton, DeleteButton,
    Edit, SimpleForm, TextInput, Create
} from 'react-admin';

export const DepartmentList = props => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="external_id" label="External ID" />
            <TextField source="name" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const DepartmentEdit = props => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="external_id" disabled />
            <TextInput source="name" />
        </SimpleForm>
    </Edit>
);

export const DepartmentCreate = props => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
        </SimpleForm>
    </Create>
);