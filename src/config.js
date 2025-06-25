// You can override resource labels, hide columns, set reference display fields, etc here.
const config = {
  apiUrl: "http://db-hid-source:3000",
  // Example:
  overrides: {
    // persons: {
    //   label: "People",
    //   list: { hide: ["excluded", "blocked"] },
    //   fields: { display_name: { label: "Full Name" } }
    // }
  },
  defaultReferenceField: "name", // fallback for referenced tables
};
export default config;