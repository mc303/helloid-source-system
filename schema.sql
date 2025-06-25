-- Departments
DROP TABLE IF EXISTS departments CASCADE;
CREATE TABLE departments (
  external_id           TEXT PRIMARY KEY,
  display_name          TEXT NOT NULL,
  code                  TEXT,
  parent_external_id    TEXT,
  manager_person_id     UUID REFERENCES persons(person_id)
);

-- Persons
DROP TABLE IF EXISTS persons CASCADE;
CREATE TABLE persons (
  person_id             UUID PRIMARY KEY,
  display_name          TEXT NOT NULL,
  external_id           TEXT,
  user_name             TEXT,
  excluded              INTEGER,
  gender                TEXT,
  honorific_prefix      TEXT,
  honorific_suffix      TEXT,
  birth_date            TEXT,
  birth_locality        TEXT,
  marital_status        TEXT,
  initials              TEXT,
  given_name            TEXT,
  nick_name             TEXT,
  family_name           TEXT,
  family_name_prefix    TEXT,
  family_name_partner   TEXT,
  family_name_partner_prefix TEXT,
  convention            TEXT,
  primary_manager_person_id     UUID REFERENCES persons(person_id),
  blocked               INTEGER,
  status_reason         TEXT,
  hr_excluded           INTEGER,
  manual_excluded       INTEGER
);

-- Contacts
DROP TABLE IF EXISTS contacts CASCADE;
CREATE TABLE contacts (
  person_id             UUID REFERENCES persons(person_id),
  type                  TEXT,
  email                 TEXT,
  phone_mobile          TEXT,
  phone_fixed           TEXT,
  address_street        TEXT,
  address_street_ext    TEXT,
  address_house_number  TEXT,
  address_house_number_ext TEXT,
  address_postal        TEXT,
  address_locality      TEXT,
  address_country       TEXT
);

-- Locations
DROP TABLE IF EXISTS locations CASCADE;
CREATE TABLE locations (
  external_id           TEXT PRIMARY KEY,
  code                  TEXT,
  name                  TEXT
);

-- Cost_centers
DROP TABLE IF EXISTS cost_centers CASCADE;
CREATE TABLE cost_centers (
  external_id TEXT PRIMARY KEY,
  code        TEXT,
  name        TEXT
);

-- Cost_bearers
DROP TABLE IF EXISTS cost_bearers CASCADE;
CREATE TABLE cost_bearers (
  external_id TEXT PRIMARY KEY,
  code        TEXT,
  name        TEXT
);

-- Employers
DROP TABLE IF EXISTS employers CASCADE;
CREATE TABLE employers (
  external_id TEXT PRIMARY KEY,
  code        TEXT,
  name        TEXT
);

-- Teams
DROP TABLE IF EXISTS teams CASCADE;
CREATE TABLE teams (
  external_id TEXT PRIMARY KEY,
  code        TEXT,
  name        TEXT
);

-- Divisions
DROP TABLE IF EXISTS divisions CASCADE;
CREATE TABLE divisions (
  external_id TEXT PRIMARY KEY,
  code        TEXT,
  name        TEXT
);

-- Titles
DROP TABLE IF EXISTS titles CASCADE;
CREATE TABLE titles (
  external_id TEXT PRIMARY KEY,
  code        TEXT,
  name        TEXT
);

-- Organizations
DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations (
  external_id TEXT PRIMARY KEY,
  code        TEXT,
  name        TEXT
);

-- Contracts
DROP TABLE IF EXISTS contracts CASCADE;
CREATE TABLE contracts (
  person_id             UUID REFERENCES persons(person_id),
  contract_id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  start_date            TEXT,
  end_date              TEXT,
  type_code             TEXT,
  type_description      TEXT,
  fte                   REAL,
  hours_per_week        REAL,
  percentage            REAL,
  sequence              INTEGER,
  manager_person_id     UUID REFERENCES persons(person_id),
  location_id           TEXT REFERENCES locations(external_id),
  cost_center_id        TEXT REFERENCES cost_centers(external_id),
  cost_bearer_id        TEXT REFERENCES cost_bearers(external_id),
  employer_id           TEXT REFERENCES employers(external_id),
  team_id               TEXT REFERENCES teams(external_id),
  department_id         TEXT REFERENCES departments(external_id),
  division_id           TEXT REFERENCES divisions(external_id),
  title_id              TEXT REFERENCES titles(external_id),
  organization_id       TEXT REFERENCES organizations(external_id)
);

-- Indexes for performance on foreign keys
CREATE INDEX idx_departments_parent_external_id ON departments(parent_external_id);
CREATE INDEX idx_departments_manager_person_id ON departments(manager_person_id);
CREATE INDEX idx_persons_primary_manager_person_id ON persons(primary_manager_person_id);
CREATE INDEX idx_contacts_person_id ON contacts(person_id);
CREATE INDEX idx_contracts_person_id ON contracts(person_id);
CREATE INDEX idx_contracts_manager_person_id ON contracts(manager_person_id);
CREATE INDEX idx_contracts_location_id ON contracts(location_id);
CREATE INDEX idx_contracts_cost_center_id ON contracts(cost_center_id);
CREATE INDEX idx_contracts_cost_bearer_id ON contracts(cost_bearer_id);
CREATE INDEX idx_contracts_employer_id ON contracts(employer_id);
CREATE INDEX idx_contracts_team_id ON contracts(team_id);
CREATE INDEX idx_contracts_department_id ON contracts(department_id);
CREATE INDEX idx_contracts_division_id ON contracts(division_id);
CREATE INDEX idx_contracts_title_id ON contracts(title_id);
CREATE INDEX idx_contracts_organization_id ON contracts(organization_id);
