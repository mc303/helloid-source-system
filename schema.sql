-- Create name_convention enum
CREATE TYPE name_convention AS ENUM ('B', 'BP', 'P', 'PB');

-- OrganizationalUnit table
CREATE TABLE OrganizationalUnit (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL UNIQUE,
    code              VARCHAR(20) NOT NULL UNIQUE,
    parent_unit_id    INTEGER REFERENCES OrganizationalUnit(id) ON DELETE SET NULL,
    description       TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Department table
CREATE TABLE Department (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL,
    code               VARCHAR(20) NOT NULL UNIQUE,
    org_unit_id        INTEGER NOT NULL REFERENCES OrganizationalUnit(id) ON DELETE CASCADE,
    manager_employee_id INTEGER REFERENCES Employee(id) ON DELETE SET NULL,
    description        TEXT,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (name, org_unit_id)
);

-- Address table
CREATE TYPE address_type AS ENUM ('PRIVATE', 'BUSINESS');

CREATE TABLE Address (
    id             SERIAL PRIMARY KEY,
    street         VARCHAR(200) NOT NULL,
    city           VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code    VARCHAR(20),
    country        VARCHAR(100) NOT NULL,
    type           address_type NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Employee table
CREATE TABLE Employee (
    id                          SERIAL PRIMARY KEY,
    initials                    VARCHAR(20),
    given_name                  VARCHAR(100) NOT NULL,
    nick_name                   VARCHAR(100),
    family_name                 VARCHAR(100) NOT NULL,
    family_name_prefix          VARCHAR(50),
    family_name_partner         VARCHAR(100),
    family_name_partner_prefix  VARCHAR(50),
    name_convention             name_convention NOT NULL,
    date_of_birth               DATE NOT NULL,
    gender                      VARCHAR(10),
    email                       VARCHAR(150) UNIQUE NOT NULL,
    phone_number                VARCHAR(50),
    private_address_id          INTEGER REFERENCES Address(id) ON DELETE SET NULL,
    business_address_id         INTEGER REFERENCES Address(id) ON DELETE SET NULL,
    title                       VARCHAR(100),
    hire_date                   DATE NOT NULL,
    termination_date            DATE,
    manager_employee_id         INTEGER REFERENCES Employee(id) ON DELETE SET NULL,
    is_archived                 BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Employment table
CREATE TABLE Employment (
    id                    SERIAL PRIMARY KEY,
    employee_id           INTEGER NOT NULL UNIQUE REFERENCES Employee(id) ON DELETE CASCADE,
    employment_start_date DATE NOT NULL,
    employment_end_date   DATE,
    employment_status     VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_archived           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Team table
CREATE TABLE Team (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    department_id  INTEGER NOT NULL REFERENCES Department(id) ON DELETE CASCADE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (name, department_id)
);

-- Position table
CREATE TABLE Position (
    id                   SERIAL PRIMARY KEY,
    employment_id        INTEGER NOT NULL REFERENCES Employment(id) ON DELETE CASCADE,
    department_id        INTEGER NOT NULL REFERENCES Department(id) ON DELETE RESTRICT,
    team_id              INTEGER REFERENCES Team(id) ON DELETE SET NULL,
    position_title       VARCHAR(100) NOT NULL,
    start_date           DATE NOT NULL,
    end_date             DATE,
    location             VARCHAR(100),
    is_archived          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Role table
CREATE TABLE Role (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- UserAccount table
CREATE TABLE UserAccount (
    id               SERIAL PRIMARY KEY,
    employee_id      INTEGER NOT NULL UNIQUE REFERENCES Employee(id) ON DELETE CASCADE,
    username         VARCHAR(100) NOT NULL UNIQUE,
    password_hash    VARCHAR(256) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    last_login       TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- UserRole table
CREATE TABLE UserRole (
    user_account_id INTEGER NOT NULL REFERENCES UserAccount(id) ON DELETE CASCADE,
    role_id         INTEGER NOT NULL REFERENCES Role(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_account_id, role_id)
);
