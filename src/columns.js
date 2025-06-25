// Easily edit columns and labels here per resource
export const columns = {
    contracts: [
        { source: "id", label: "ID" },
        { source: "name", label: "Name" },
        { source: "start_date", label: "Start Date" },
        { source: "end_date", label: "End Date" },
        { source: "department_id", label: "Department" }
    ],
    departments: [
        { source: "id", label: "ID" },
        { source: "name", label: "Name" }
    ],
    contacts: [
        { source: "id", label: "ID" },
        { source: "first_name", label: "First Name" },
        { source: "last_name", label: "Last Name" },
        { source: "email", label: "Email" },
        { source: "phone", label: "Phone" }
    ]
};