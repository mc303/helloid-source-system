import React from 'react';
import {
    List, Datagrid, TextField, ReferenceField, EditButton, DeleteButton,
    Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, Create, DateInput
} from 'react-admin';

export const ContractList = props => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="contract_id" label="Contract ID" />
            <TextField source="name" />
            <TextField source="start_date" />
            <TextField source="end_date" />
            <ReferenceField source="department_id" reference="departments" link="show">
                <TextField source="name" />
            </ReferenceField>
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const ContractEdit = props => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="contract_id" disabled />
            <TextInput source="name" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
            <ReferenceInput source="department_id" reference="departments">
                <SelectInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export const ContractCreate = props => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
            <ReferenceInput source="department_id" reference="departments">
                <SelectInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);