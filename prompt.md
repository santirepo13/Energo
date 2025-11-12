Create a minimal web application for the Colombian energy company Energo, using Vite + React + TypeScript (frontend, Material UI) and Node.js + Express + TypeScript (backend).
The database is called ener-go.

Requirements:

Login page (Material UI)

Dashboard:

Shows the smart meter serial (card_number) for each user—format: 14416394063 (as on actual Colombian meters)

Shows current balance in kWh (current_kwh) and pesos (current_balance)

Recharge form to enter pesos or kWh, submitting to backend

On recharge:

Updates balance

Generates and displays a new PIN code—format: 062647368815956 (as used in Colombian prepaid meters)

Shows PIN in the UI, records recharge (date, amount, kWh, card serial, PIN code)

Displays user’s recharge history (all PINs, amounts, kWh, dates)

Admin/security log table to track events like login, recharge, errors

MySQL tables (ener-go database):

sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  password_changed_at TIMESTAMP NULL
);

CREATE TABLE energy_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_number VARCHAR(50) NOT NULL UNIQUE,         -- Serial format like 14416394063
  current_balance DECIMAL(10,2) DEFAULT 0,
  current_kwh DECIMAL(10,2) DEFAULT 0,
  last_recharge TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE recharge_pins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_number VARCHAR(50) NOT NULL,
  pin_code VARCHAR(20) NOT NULL,                   -- Pin format like 062647368815956
  amount DECIMAL(10,2) NOT NULL,
  kwh DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (card_number) REFERENCES energy_cards(card_number)
);

CREATE TABLE security_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50),
  username VARCHAR(50),
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  details TEXT
);
Technical Notes:

Use Material UI for all UI components.

Initial version is deliberately low-security (plain password, session, no HTTPS, minimal validation)—for security review homework.

Backend endpoints:

/login (log events to security_logs)

/dashboard

/recharge (log events and PIN generation to security_logs)

Example values:

Card serial: 14416394063

PIN code: 062647368815956


Include a Register section/API in the Energo app, allowing new users to sign up by providing all required fields from the users table, plus their smart meter card serial (card_number).

On the frontend:

A Material UI registration form with fields:

username

password

email

card_number (for smart meter, e.g., 14416394063)

All fields are required.

Submits to backend /register endpoint.

On the backend:

Add a POST /register API endpoint.

The backend must:

Create a new user in the users table, inserting username, password_hash (hashed from password), and email.

Create a new record in energy_cards table, linking user_id (from the created user) and the provided card_number. Initialize current_balance and current_kwh to 0.

Return success or error (e.g., username/email/card_number already taken).

Update:

Sample value for card serial: 14416394063 (format as real Colombian smart meters).

Use Material UI components for the register form.

API call overview:

POST /register

json
{
  "username": "exampleuser",
  "password": "examplepw",
  "email": "example@energo.co",
  "card_number": "14416394063"
}
Success response:

json
{
  "message": "Registration successful"
}
Error response (e.g., duplicate):

json
{
  "error": "Username, email, or card number already exists"
}

cost per KwH is 900 COP 

logo of the site is logo.png 


all buttons and tables and components in general will be features, pages will be full of features, components will be full of features as well 
