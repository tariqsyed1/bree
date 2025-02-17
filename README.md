
# Bree Line of Credit Feature
Design Doc: [Google Docs](https://docs.google.com/document/d/1XbWeIE9unKI_eUfwW6SuNWI0OqghwKGkQPkhZeLAIC4/edit?usp=sharing)

Demo Video: [YouTube](https://youtu.be/lNf8Y1tFVms)

## Overview

This is a serverless backend system for managing a line of credit feature. This system allows users to apply for a line of credit, disburse funds, make repayments, cancel applications, and view their application history.  

Users can:

- Apply for a line of credit

- Disburse funds if within their credit limit

- Repay fully or partially

- Cancel applications

- View their past and current applications

Admins can:
- Reject an application

## Setup Instructions
### 1. Clone Repository
```
git clone https://github.com/tariqsyed1/bree
cd bree/line-of-credit
```
 ### 2. Install dependencies
 ```
 npm install
 ```
 ### 3. Set up PostgreSQL locally
 Make sure you have PostgreSQL installed and running. Then, create the database:
 ```
 CREATE DATABASE line_of_credit;
 ```
 Then, connect to the database and run the following:
 ```
 CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    credit_limit NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE LineOfCreditApplications (
    application_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    requested_amount NUMERIC(10, 2) NOT NULL,
    current_balance NUMERIC(10, 2) NOT NULL,
    state VARCHAR(20) NOT NULL CHECK (state IN ('Open', 'Cancelled', 'Rejected', 'Outstanding', 'Repaid')),
    express_delivery BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    application_id INT REFERENCES LineOfCreditApplications(application_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Disbursement', 'Repayment')),
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

 ```
 ### 4. Configure environment variables
 Create a .env file in the root directory and add variables for your AWS if you plan on deploying this to the cloud. If you plan on running this locally instead, add the following to .env
 ```
 DATABASE_URL=postgresql://localhost:5432/line_of_credit
 ```

### 5. Run the server locally
```
npm run build
sam build
sam local start-api
```
### 6. Interact with the API
Start by creating an application. Refer to the section below for more guidance on API request and response schema. 
```
curl http://127.0.0.1:3000/createApplication
```

## API Endpoints
### /createApplication
* Endpoint: `POST /createApplication`
* Body: `{
  "userId": "123",
  "requestedAmount": 1000,
  "expressDelivery": true
}
`
* Success Response (201): `{ "application_id": 1, "state": "Open", ... }
`
### /disburseFunds
* Endpoint: `POST /disburseFunds`
* Body: `{
  "applicationId": "1",
  "disbursementAmount": 500
}
`
* Success Response (200): `{ "message": "Funds disbursed successfully." }
`

### /repayApplication
* Endpoint: `POST /repayApplication`
* Body: `{
  "applicationId": "1",
  "repaymentAmount": 300
}
`
* Success Response (200): `{ "message": "Repayment processed successfully." }
`

### /cancelApplication
* Endpoint: `POST /cancelApplication`
* Body: `{
  "applicationId": "1"
}
`
* Success Response (200): `{ "message": "Application cancelled successfully." }
`

### /viewApplicationHistory
* Endpoint: `POST /viewApplicationHistory`
* Body: `{user_id: 1}`
* Success Response (200): `[
  {
    "application_id": 1,
    "state": "Outstanding",
    "transactions": [
      { "transaction_type": "Disbursement", "amount": 500 }
    ]
  }
]
`

### /rejectApplication (Admin Only)
* Endpoint: POST `/rejectApplication?isAdmin=true`
* Body: `{
  "applicationId": "1"
}
`
* Success Response (200): `{ "message": "Application rejected successfully." }
`

## Testing with Postman
You can find a link to my Postman collection in the root /bree folder. Here's some steps on how to run the collection:
 
1. Start the server by running `sam local start-api`
2. Open Postman and import my postman collection.js file.
5. Click send and you should see the response in the output window.