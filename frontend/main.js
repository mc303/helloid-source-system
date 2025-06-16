// Config for columns to display and their headers
const tableConfigs = {
  Contracts: {
    endpoint: "contracts",
    columns: [
      "person_id",
      "contract_external_id",
      "start_date",
      "end_date",
      "context_in_conditions",
      "type_code",
      "type_description",
      "fte",
      "hours_per_week",
      "percentage",
      "sequence",
      "location_id",
      "cost_center_id",
      "cost_bearer_id",
      "employer_id",
      "manager_person_id",
      "team_id",
      "department_id",
      "division_id",
      "title_id",
      "organization_id",
    ],
    headers: [
      "Person ID",
      "Contract ID",
      "Start Date",
      "End Date",
      "Context",
      "Type Code",
      "Type Description",
      "FTE",
      "Hours/Week",
      "Percentage",
      "Sequence",
      "Location",
      "Cost Center",
      "Cost Bearer",
      "Employer",
      "Manager",
      "Team",
      "Department",
      "Division",
      "Title",
      "Organization",
    ],
    searchableFields: {
      contract_external_id: { type: "text", label: "Contract ID" },
      type_code: { type: "text", label: "Type Code" },
      type_description: { type: "text", label: "Type Description" },
      start_date: { type: "date", label: "Start Date" },
      end_date: { type: "date", label: "End Date" },
      fte: { type: "number", label: "FTE" },
      hours_per_week: { type: "number", label: "Hours/Week" },
    },
  },
  Departments: {
    endpoint: "departments",
    columns: [
      "external_id",
      "display_name",
      "code",
      "parent_external_id",
      "manager_person_id",
    ],
    headers: [
      "External ID",
      "Display Name",
      "Code",
      "Parent ID",
      "Manager Person ID",
    ],
    searchableFields: {
      external_id: { type: "text", label: "External ID" },
      display_name: { type: "text", label: "Display Name" },
      code: { type: "text", label: "Code" },
    },
  },
  Contacts: {
    endpoint: "contacts",
    columns: [
      "person_id",
      "type",
      "email",
      "phone_mobile",
      "phone_fixed",
      "address_street",
      "address_street_ext",
      "address_house_number",
      "address_house_number_ext",
      "address_postal",
      "address_locality",
      "address_country",
    ],
    headers: [
      "Person ID",
      "Type",
      "Email",
      "Mobile",
      "Fixed",
      "Street",
      "Street Ext",
      "House #",
      "House # Ext",
      "Postal",
      "Locality",
      "Country",
    ],
    searchableFields: {
      type: { type: "text", label: "Type" },
      email: { type: "text", label: "Email" },
      phone_mobile: { type: "text", label: "Mobile" },
      phone_fixed: { type: "text", label: "Fixed" },
      address_locality: { type: "text", label: "Locality" },
      address_country: { type: "text", label: "Country" },
    },
  },
};

const API_BASE = "http://localhost:3000";
let currentEntity = "Contracts";
let currentData = [];
let activeFilters = {};
let currentPage = 0;
const pageSize = 50;
let isLoading = false;
let hasMoreData = true;
let observer = null;

function resetPagination() {
  currentPage = 0;
  hasMoreData = true;
  currentData = [];
}

function setHeader(title) {
  document.getElementById("header-title").textContent = title;
}

function updateRecordCounter(count) {
  document.getElementById("record-counter").textContent = `${count} records`;
}

function renderTable(entity, data, append = false) {
  const config = tableConfigs[entity];
  if (!config) return;
  const { columns, headers } = config;

  let html = "";
  if (!append) {
    html = `
      <div class="overflow-x-auto" style="max-height: calc(100vh - 4rem); overflow-y: auto;" id="table-container">
        <table class="min-w-full border border-gray-300 text-xs">
          <thead class="bg-gray-100 sticky top-0 z-10">
            <tr>
              ${headers
                .map(
                  (h) =>
                    `<th class="px-2 py-2 border-b border-gray-300 font-semibold text-left whitespace-nowrap">${h}</th>`
                )
                .join("")}
            </tr>
          </thead>
          <tbody id="table-body">
    `;
  }

  html += data
    .map(
      (row) => `
    <tr class="hover:bg-gray-50">
      ${columns
        .map(
          (col) =>
            `<td class="px-2 py-1 border-b border-gray-200 whitespace-nowrap">${
              row[col] ?? ""
            }</td>`
        )
        .join("")}
    </tr>
  `
    )
    .join("");

  if (!append) {
    html += `
          </tbody>
        </table>
        <div id="loading-indicator" class="hidden py-4 text-center text-gray-500">
          Loading more data...
        </div>
      </div>
    `;
    document.getElementById("main-content").innerHTML = html;
  } else {
    document.getElementById("table-body").insertAdjacentHTML("beforeend", html);
  }

  updateRecordCounter(currentData.length);
}

function buildQueryParams(searchTerm, filters, page = 0) {
  const params = new URLSearchParams();

  // Quick search across all fields using OR
  if (searchTerm) {
    const searchFields = Object.keys(
      tableConfigs[currentEntity].searchableFields
    );
    const searchConditions = searchFields.map(
      (field) => `${field}.ilike.*${searchTerm}*`
    );
    params.append("or", `(${searchConditions.join(",")})`);
  }

  // Advanced filters
  Object.entries(filters).forEach(([field, value]) => {
    if (!value) return;

    const fieldConfig = tableConfigs[currentEntity].searchableFields[field];
    if (!fieldConfig) return;

    switch (fieldConfig.type) {
      case "text":
        params.append(field, `ilike.*${value}*`);
        break;
      case "number":
        if (value.startsWith(">")) {
          params.append(field, `gt.${value.substring(1)}`);
        } else if (value.startsWith("<")) {
          params.append(field, `lt.${value.substring(1)}`);
        } else if (value.startsWith(">=")) {
          params.append(field, `gte.${value.substring(2)}`);
        } else if (value.startsWith("<=")) {
          params.append(field, `lte.${value.substring(2)}`);
        } else {
          params.append(field, `eq.${value}`);
        }
        break;
      case "date":
        if (value.startsWith(">")) {
          params.append(field, `gt.${value.substring(1)}`);
        } else if (value.startsWith("<")) {
          params.append(field, `lt.${value.substring(1)}`);
        } else if (value.startsWith(">=")) {
          params.append(field, `gte.${value.substring(2)}`);
        } else if (value.startsWith("<=")) {
          params.append(field, `lte.${value.substring(2)}`);
        } else {
          params.append(field, `eq.${value}`);
        }
        break;
    }
  });

  // Add pagination
  params.append("limit", pageSize);
  params.append("offset", page * pageSize);

  // Add entity-specific ordering
  switch (currentEntity) {
    case "Contracts":
      params.append("order", "contract_external_id.desc");
      break;
    case "Departments":
      params.append("order", "external_id.desc");
      break;
    case "Contacts":
      params.append("order", "person_id.desc");
      break;
  }

  return params.toString();
}

async function checkApiConnection() {
  try {
    const res = await fetch(`${API_BASE}/contracts?limit=1`);
    return res.ok;
  } catch (e) {
    console.error("API Connection Error:", e);
    return false;
  }
}

function showError(message, details = "") {
  const errorHtml = `
    <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-red-800 font-medium">${message}</h3>
      </div>
      ${details ? `<p class="mt-2 text-sm text-red-600">${details}</p>` : ""}
      <div class="mt-4">
        <p class="text-sm text-gray-600">Please check:</p>
        <ul class="list-disc list-inside text-sm text-gray-600 mt-1">
          <li>Is PostgREST running at ${API_BASE}?</li>
          <li>Is the database connection working?</li>
          <li>Are the required tables created?</li>
        </ul>
      </div>
    </div>
  `;
  document.getElementById("main-content").innerHTML = errorHtml;
  updateRecordCounter(0);
}

async function loadData(
  entity,
  searchTerm = "",
  filters = {},
  page = 0,
  append = false
) {
  if (isLoading || !hasMoreData) return;

  setHeader(entity);
  currentEntity = entity;
  const config = tableConfigs[entity];
  if (!config) return;

  if (!append) {
    document.getElementById("main-content").innerHTML =
      '<div class="text-gray-400">Loading...</div>';
  } else {
    document.getElementById("loading-indicator").classList.remove("hidden");
  }

  isLoading = true;

  try {
    const isConnected = await checkApiConnection();
    if (!isConnected) {
      throw new Error("Cannot connect to PostgREST API");
    }

    const queryParams = buildQueryParams(searchTerm, filters, page);
    const url = `${API_BASE}/${config.endpoint}${
      queryParams ? `?${queryParams}` : ""
    }`;

    console.log("Fetching data from:", url);

    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `API Error: ${res.status} ${res.statusText}\n${errorText}`
      );
    }

    const newData = await res.json();
    hasMoreData = newData.length === pageSize;

    if (append) {
      currentData = [...currentData, ...newData];
    } else {
      currentData = newData;
    }

    renderTable(entity, newData, append);
    if (!append) {
      renderAdvancedSearchFilters(entity);
      setupInfiniteScroll();
      setupScrollTopButton(); 
    }
  } catch (e) {
    console.error("Data loading error:", e);
    showError("Failed to load data", e.message);
  } finally {
    isLoading = false;
    document.getElementById("loading-indicator").classList.add("hidden");
  }
}

function renderAdvancedSearchFilters(entity) {
  const config = tableConfigs[entity];
  if (!config || !config.searchableFields) return;

  const filtersContainer = document.getElementById("advanced-search-filters");
  filtersContainer.innerHTML = "";

  Object.entries(config.searchableFields).forEach(
    ([field, { type, label }]) => {
      const filterHtml = `
      <div class="grid grid-cols-3 gap-4 items-center">
        <label class="text-sm font-medium text-gray-700">${label}</label>
        <div class="col-span-2">
          ${
            type === "text"
              ? `
            <input type="text" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   data-field="${field}"
                   placeholder="Search ${label.toLowerCase()}">
          `
              : type === "date"
              ? `
            <input type="date" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   data-field="${field}">
          `
              : type === "number"
              ? `
            <input type="number" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   data-field="${field}"
                   step="any">
          `
              : ""
          }
        </div>
      </div>
    `;
      filtersContainer.insertAdjacentHTML("beforeend", filterHtml);
    }
  );
}

function setupScrollTopButton() {
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const tableContainer = document.getElementById('table-container');

  if (!scrollTopBtn || !tableContainer) return;

  // Remove existing listeners
  tableContainer.onscroll = null;
  scrollTopBtn.onclick = null;

  tableContainer.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('hidden', tableContainer.scrollTop < 300);
  });

  scrollTopBtn.addEventListener('click', () => {
    tableContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupInfiniteScroll() {
  if (observer) observer.disconnect();

  const tableContainer = document.getElementById("table-container");
  const loadingIndicator = document.getElementById("loading-indicator");
  if (!tableContainer || !loadingIndicator) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading && hasMoreData) {
          currentPage++;
          const searchInput = document.getElementById("search-input");
          loadData(
            currentEntity,
            searchInput.value,
            activeFilters,
            currentPage,
            true
          );
        }
      });
    },
    {
      root: tableContainer,
      threshold: 1.0,
    }
  );

  observer.observe(loadingIndicator);

  const scrollTopBtn = document.getElementById("scroll-top-btn");
  // const tableContainer = document.getElementById("table-container");

  if (tableContainer && scrollTopBtn) {
    tableContainer.addEventListener("scroll", () => {
      scrollTopBtn.classList.toggle("hidden", tableContainer.scrollTop < 300);
    });

    scrollTopBtn.addEventListener("click", () => {
      tableContainer.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Sidebar navigation
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const selected = this.getAttribute("data-menu");
      menuItems.forEach((btn) =>
        btn.classList.remove("bg-gray-300", "font-bold")
      );
      this.classList.add("bg-gray-300", "font-bold");
      resetPagination();
      loadData(selected);
    });
  });

  // Quick search with debounce
  const searchInput = document.getElementById("search-input");
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value;
      resetPagination();
      loadData(currentEntity, searchTerm, activeFilters);
    }, 300);
  });

  // Advanced search modal
  const modal = document.getElementById("advanced-search-modal");
  const advancedSearchBtn = document.getElementById("advanced-search-btn");
  const closeModalBtn = document.getElementById("close-modal");
  const resetFiltersBtn = document.getElementById("reset-filters");
  const applyFiltersBtn = document.getElementById("apply-filters");

  advancedSearchBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  resetFiltersBtn.addEventListener("click", () => {
    activeFilters = {};
    const inputs = document.querySelectorAll("#advanced-search-filters input");
    inputs.forEach((input) => (input.value = ""));
    resetPagination();
    loadData(currentEntity, searchInput.value, {});
  });

  applyFiltersBtn.addEventListener("click", () => {
    activeFilters = {};
    const inputs = document.querySelectorAll("#advanced-search-filters input");
    inputs.forEach((input) => {
      if (input.value) {
        const field = input.dataset.field;
        const type = tableConfigs[currentEntity].searchableFields[field].type;
        activeFilters[field] =
          type === "number" ? Number(input.value) : input.value;
      }
    });
    resetPagination();
    loadData(currentEntity, searchInput.value, activeFilters);
    modal.classList.add("hidden");
  });

  // Initial load
  document
    .querySelector('.menu-item[data-menu="Contracts"]')
    .classList.add("bg-gray-300", "font-bold");
  loadData("Contracts");
  setupInfiniteScroll();

  const scrollTopBtn = document.getElementById("scroll-top-btn");

  document.addEventListener("DOMContentLoaded", () => {
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      tableContainer.addEventListener("scroll", () => {
        scrollTopBtn.classList.toggle("hidden", tableContainer.scrollTop < 300);
      });
    }

    scrollTopBtn.addEventListener("click", () => {
      tableContainer.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
});
