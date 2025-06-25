import React from "react";
import { Box, TextField, Button } from "@mui/material";

const SearchBar = ({ value, onChange, onSearch, onAdvanced }) => (
    <Box display="flex" alignItems="center" mb={1} gap={1}>
        <TextField
            size="small"
            variant="outlined"
            placeholder="Search..."
            value={value}
            onChange={e => onChange(e.target.value)}
            sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={onSearch}>Search</Button>
        <Button variant="outlined" onClick={onAdvanced}>Advanced Search</Button>
    </Box>
);

export default SearchBar;