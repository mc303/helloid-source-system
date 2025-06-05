// main.js: vanilla JS to handle CRUD + Archive for Employees, Employments, Positions

/** CONFIGURATION **/
const API_URL = 'http://localhost:3000'; // Change if PostgREST is elsewhere

/** UTILITY: Simplify fetch + JSON error handling **/
async function requestJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorMsg = `(${res.status})`;
    try {
      const err = await res.json();
      if (err.message) errorMsg = err.message;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.status === 204 ? null : res.json();
}

/** TAB SWITCHING LOGIC **/
const tabs = document.querySelectorAll('.tab-button');
tabs.forEach((btn) =>
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((sec) => sec.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  })
);

/** EMPLOYEES: CRUD + Archive **/
const empTableBody = document.querySelector('#employees-table tbody');
const empForm = document.getElementById('employee-form');
const empFormTitle = document.getElementById('employee-form-title');
const empSubmitButton = document.getElementById('emp-submit-button');
const empErrorDiv = document.getElementById('emp-form-error');
const empShowArchivedCheckbox = document.getElementById('show-archived-employees');
let empEditId = null;

async function loadEmployees() {
  empTableBody.innerHTML = '';
  const showArchived = empShowArchivedCheckbox.checked;
  const filter = showArchived ? '' : '?is_archived=eq.false';
  try {
    const employees = await requestJSON(`${API_URL}/employees${filter}&order=id.asc`);
    if (employees.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="15" style="text-align:center;">No employees found.</td>`;
      empTableBody.appendChild(tr);
      return;
    }
    for (const emp of employees) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.initials || ''}</td>
        <td>${emp.given_name || ''}</td>
        <td>${emp.nick_name || ''}</td>
        <td>${emp.family_name || ''}</td>
        <td>${emp.family_name_prefix || ''}</td>
        <td>${emp.family_name_partner || ''}</td>
        <td>${emp.family_name_partner_prefix || ''}</td>
        <td>${emp.name_convention || ''}</td>
        <td>${emp.email || ''}</td>
        <td>${emp.phone_number || ''}</td>
        <td>${emp.hire_date || ''}</td>
        <td>${emp.termination_date || ''}</td>
        <td>${emp.is_archived}</td>
        <td class="actions">
          <button class="edit" data-id="${emp.id}">Edit</button>
          <button class="archive" data-id="${emp.id}">${emp.is_archived ? 'Unarchive' : 'Archive'}</button>
          <button class="delete" data-id="${emp.id}">Delete</button>
        </td>
      `;
      empTableBody.appendChild(tr);
    }
  } catch (err) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="15" style="color:red;text-align:center;">Error: ${err.message}</td>`;
    empTableBody.appendChild(tr);
  }
}

empShowArchivedCheckbox.addEventListener('change', () => {
  resetEmployeeForm();
  loadEmployees();
});

empTableBody.addEventListener('click', async (evt) => {
  const btn = evt.target;
  if (!btn.dataset.id) return;
  const id = btn.dataset.id;

  if (btn.classList.contains('edit')) {
    try {
      const emp = await requestJSON(`${API_URL}/employees?id=eq.${id}`);
      if (!emp.length) throw new Error('Employee not found');
      populateEmployeeForm(emp[0]);
    } catch (err) {
      empErrorDiv.textContent = err.message;
    }
  } else if (btn.classList.contains('archive')) {
    const shouldArchive = btn.textContent.trim() === 'Archive';
    try {
      await requestJSON(`${API_URL}/employees?id=eq.${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({is_archived: shouldArchive}),
      });
      resetEmployeeForm();
      loadEmployees();
    } catch (err) {
      empErrorDiv.textContent = err.message;
    }
  } else if (btn.classList.contains('delete')) {
    if (!confirm('Delete permanently?')) return;
    try {
      await requestJSON(`${API_URL}/employees?id=eq.${id}`, {method: 'DELETE'});
      resetEmployeeForm();
      loadEmployees();
    } catch (err) {
      empErrorDiv.textContent = err.message;
    }
  }
});

function populateEmployeeForm(emp) {
  empFormTitle.textContent = `Edit Employee (ID ${emp.id})`;
  empSubmitButton.textContent = 'Update Employee';
  empErrorDiv.textContent = '';
  empEditId = emp.id;
  empForm.initials.value = emp.initials || '';
  empForm.given_name.value = emp.given_name || '';
  empForm.nick_name.value = emp.nick_name || '';
  empForm.family_name.value = emp.family_name || '';
  empForm.family_prefix.value = emp.family_name_prefix || '';
  empForm.family_partner.value = emp.family_name_partner || '';
  empForm.family_partner_prefix.value = emp.family_name_partner_prefix || '';
  empForm.name_convention.value = emp.name_convention || 'B';
  empForm.date_of_birth.value = emp.date_of_birth || '';
  empForm.email.value = emp.email || '';
  empForm.phone_number.value = emp.phone_number || '';
  empForm.hire_date.value = emp.hire_date || '';
  empForm.termination_date.value = emp.termination_date || '';
  empForm.is_archived.value = emp.is_archived ? 'true' : 'false';
}

function resetEmployeeForm() {
  empFormTitle.textContent = 'Add New Employee';
  empSubmitButton.textContent = 'Create Employee';
  empErrorDiv.textContent = '';
  empEditId = null;
  empForm.reset();
}

empForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  empErrorDiv.textContent = '';

  const payload = {
    initials: empForm.initials.value.trim() || null,
    given_name: empForm.given_name.value.trim(),
    nick_name: empForm.nick_name.value.trim() || null,
    family_name: empForm.family_name.value.trim(),
    family_name_prefix: empForm.family_prefix.value.trim() || null,
    family_name_partner: empForm.family_partner.value.trim() || null,
    family_name_partner_prefix: empForm.family_partner_prefix.value.trim() || null,
    name_convention: empForm.name_convention.value,
    date_of_birth: empForm.date_of_birth.value,
    email: empForm.email.value.trim(),
    phone_number: empForm.phone_number.value.trim() || null,
    hire_date: empForm.hire_date.value,
    termination_date: empForm.termination_date.value || null,
    is_archived: empForm.is_archived.value === 'true',
  };

  if (!payload.given_name || !payload.family_name || !payload.name_convention || !payload.date_of_birth || !payload.email || !payload.hire_date) {
    empErrorDiv.textContent = 'Please fill in all required (*) fields.';
    return;
  }

  try {
    if (empEditId) {
      await requestJSON(`${API_URL}/employees?id=eq.${empEditId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    } else {
      await requestJSON(`${API_URL}/employees`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    }
    resetEmployeeForm();
    loadEmployees();
  } catch (err) {
    empErrorDiv.textContent = err.message;
  }
});

/** EMPLOYMENTS: CRUD + Archive **/
const empmTableBody = document.querySelector('#employments-table tbody');
const empmForm = document.getElementById('employment-form');
const empmFormTitle = document.getElementById('employment-form-title');
const empmSubmitButton = document.getElementById('empm-submit-button');
const empmErrorDiv = document.getElementById('empm-form-error');
const empmShowArchivedCheckbox = document.getElementById('show-archived-employments');
let empmEditId = null;

async function loadEmployments() {
  empmTableBody.innerHTML = '';
  const showArchived = empmShowArchivedCheckbox.checked;
  const filter = showArchived ? '' : '?is_archived=eq.false';
  try {
    const employments = await requestJSON(`${API_URL}/employments${filter}&order=id.asc`);
    if (employments.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="7" style="text-align:center;">No employments found.</td>`;
      empmTableBody.appendChild(tr);
      return;
    }
    for (const e of employments) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${e.id}</td>
        <td>${e.employee_id}</td>
        <td>${e.employment_start_date || ''}</td>
        <td>${e.employment_end_date || ''}</td>
        <td>${e.employment_status || ''}</td>
        <td>${e.is_archived}</td>
        <td class="actions">
          <button class="edit" data-id="${e.id}">Edit</button>
          <button class="archive" data-id="${e.id}">${e.is_archived ? 'Unarchive' : 'Archive'}</button>
          <button class="delete" data-id="${e.id}">Delete</button>
        </td>
      `;
      empmTableBody.appendChild(tr);
    }
  } catch (err) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="7" style="color:red;text-align:center;">Error: ${err.message}</td>`;
    empmTableBody.appendChild(tr);
  }
}

empmShowArchivedCheckbox.addEventListener('change', () => {
  resetEmploymentForm();
  loadEmployments();
});

empmTableBody.addEventListener('click', async (evt) => {
  const btn = evt.target;
  if (!btn.dataset.id) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('edit')) {
    try {
      const e = await requestJSON(`${API_URL}/employments?id=eq.${id}`);
      if (!e.length) throw new Error('Employment not found');
      populateEmploymentForm(e[0]);
    } catch (err) {
      empmErrorDiv.textContent = err.message;
    }
  } else if (btn.classList.contains('archive')) {
    const shouldArchive = btn.textContent.trim() === 'Archive';
    try {
      await requestJSON(`${API_URL}/employments?id=eq.${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({is_archived: shouldArchive}),
      });
      resetEmploymentForm();
      loadEmployments();
    } catch (err) {
      empmErrorDiv.textContent = err.message;
    }
  } else if (btn.classList.contains('delete')) {
    if (!confirm('Delete permanently?')) return;
    try {
      await requestJSON(`${API_URL}/employments?id=eq.${id}`, {method: 'DELETE'});
      resetEmploymentForm();
      loadEmployments();
    } catch (err) {
      empmErrorDiv.textContent = err.message;
    }
  }
});

function populateEmploymentForm(e) {
  empmFormTitle.textContent = `Edit Employment (ID ${e.id})`;
  empmSubmitButton.textContent = 'Update Employment';
  empmErrorDiv.textContent = '';
  empmEditId = e.id;
  empmForm.employee_id.value = e.employee_id;
  empmForm.employment_start_date.value = e.employment_start_date || '';
  empmForm.employment_end_date.value = e.employment_end_date || '';
  empmForm.employment_status.value = e.employment_status || '';
  empmForm.is_archived.value = e.is_archived ? 'true' : 'false';
}

function resetEmploymentForm() {
  empmFormTitle.textContent = 'Add New Employment';
  empmSubmitButton.textContent = 'Create Employment';
  empmErrorDiv.textContent = '';
  empmEditId = null;
  empmForm.reset();
}

empmForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  empmErrorDiv.textContent = '';
  const payload = {
    employee_id: parseInt(empmForm.employee_id.value, 10),
    employment_start_date: empmForm.employment_start_date.value,
    employment_end_date: empmForm.employment_end_date.value || null,
    employment_status: empmForm.employment_status.value.trim(),
    is_archived: empmForm.is_archived.value === 'true',
  };
  if (!payload.employee_id || !payload.employment_start_date || !payload.employment_status) {
    empmErrorDiv.textContent = 'Please fill in all required (*) fields.';
    return;
  }
  try {
    if (empmEditId) {
      await requestJSON(`${API_URL}/employments?id=eq.${empmEditId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    } else {
      await requestJSON(`${API_URL}/employments`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    }
    resetEmploymentForm();
    loadEmployments();
  } catch (err) {
    empmErrorDiv.textContent = err.message;
  }
});

/** POSITIONS: CRUD + Archive **/
const posTableBody = document.querySelector('#positions-table tbody');
const posForm = document.getElementById('position-form');
const posFormTitle = document.getElementById('position-form-title');
const posSubmitButton = document.getElementById('pos-submit-button');
const posErrorDiv = document.getElementById('pos-form-error');
const posShowArchivedCheckbox = document.getElementById('show-archived-positions');
let posEditId = null;

async function loadPositions() {
  posTableBody.innerHTML = '';
  const showArchived = posShowArchivedCheckbox.checked;
  const filter = showArchived ? '' : '?is_archived=eq.false';
  try {
    const positions = await requestJSON(`${API_URL}/positions${filter}&order=id.asc`);
    if (positions.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="10" style="text-align:center;">No positions found.</td>`;
      posTableBody.appendChild(tr);
      return;
    }
    for (const p of positions) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.employment_id}</td>
        <td>${p.department_id}</td>
        <td>${p.team_id || ''}</td>
        <td>${p.position_title || ''}</td>
        <td>${p.start_date || ''}</td>
        <td>${p.end_date || ''}</td>
        <td>${p.location || ''}</td>
        <td>${p.is_archived}</td>
        <td class="actions">
          <button class="edit" data-id="${p.id}">Edit</button>
          <button class="archive" data-id="${p.id}">${p.is_archived ? 'Unarchive' : 'Archive'}</button>
          <button class="delete" data-id="${p.id}">Delete</button>
        </td>
      `;
      posTableBody.appendChild(tr);
    }
  } catch (err) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="10" style="color:red;text-align:center;">Error: ${err.message}</td>`;
    posTableBody.appendChild(tr);
  }
}

posShowArchivedCheckbox.addEventListener('change', () => {
  resetPositionForm();
  loadPositions();
});

posTableBody.addEventListener('click', async (evt) => {
  const btn = evt.target;
  if (!btn.dataset.id) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('edit')) {
    try {
      const p = await requestJSON(`${API_URL}/positions?id=eq.${id}`);
      if (!p.length) throw new Error('Position not found');
      populatePositionForm(p[0]);
    } catch (err) {
      posErrorDiv.textContent = err.message;
    }
  } else if (btn.classList.contains('archive')) {
    const shouldArchive = btn.textContent.trim() === 'Archive';
    try {
      await requestJSON(`${API_URL}/positions?id=eq.${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({is_archived: shouldArchive}),
      });
      resetPositionForm();
      loadPositions();
    } catch (err) {
      posErrorDiv.textContent = err.message;
    }
  } else if (btn.classList.contains('delete')) {
    if (!confirm('Delete permanently?')) return;
    try {
      await requestJSON(`${API_URL}/positions?id=eq.${id}`, {method: 'DELETE'});
      resetPositionForm();
      loadPositions();
    } catch (err) {
      posErrorDiv.textContent = err.message;
    }
  }
});

function populatePositionForm(p) {
  posFormTitle.textContent = `Edit Position (ID ${p.id})`;
  posSubmitButton.textContent = 'Update Position';
  posErrorDiv.textContent = '';
  posEditId = p.id;
  posForm.employment_id.value = p.employment_id;
  posForm.department_id.value = p.department_id;
  posForm.team_id.value = p.team_id || '';
  posForm.position_title.value = p.position_title || '';
  posForm.start_date.value = p.start_date || '';
  posForm.end_date.value = p.end_date || '';
  posForm.location.value = p.location || '';
  posForm.is_archived.value = p.is_archived ? 'true' : 'false';
}

function resetPositionForm() {
  posFormTitle.textContent = 'Add New Position';
  posSubmitButton.textContent = 'Create Position';
  posErrorDiv.textContent = '';
  posEditId = null;
  posForm.reset();
}

posForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  posErrorDiv.textContent = '';
  const payload = {
    employment_id: parseInt(posForm.employment_id.value, 10),
    department_id: parseInt(posForm.department_id.value, 10),
    team_id: posForm.team_id.value ? parseInt(posForm.team_id.value, 10) : null,
    position_title: posForm.position_title.value.trim(),
    start_date: posForm.start_date.value,
    end_date: posForm.end_date.value || null,
    location: posForm.location.value.trim() || null,
    is_archived: posForm.is_archived.value === 'true',
  };
  if (!payload.employment_id || !payload.department_id || !payload.position_title || !payload.start_date) {
    posErrorDiv.textContent = 'Please fill in all required (*) fields.';
    return;
  }
  try {
    if (posEditId) {
      await requestJSON(`${API_URL}/positions?id=eq.${posEditId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    } else {
      await requestJSON(`${API_URL}/positions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    }
    resetPositionForm();
    loadPositions();
  } catch (err) {
    posErrorDiv.textContent = err.message;
  }
});

/** INITIAL LOAD **/
window.addEventListener('DOMContentLoaded', () => {
  loadEmployees();
  loadEmployments();
  loadPositions();
});
