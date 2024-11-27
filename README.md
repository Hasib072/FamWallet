# FamWallet - Family Expense Insights

FamWallet is a comprehensive solution designed to help families manage and analyze their financial data efficiently. The project includes both a backend API and a mobile frontend application, focusing on family-level and member-level expense analysis.


### **Download Apk: [https://expo.dev/accounts/ha51b72/projects/famwallet-frontend/builds/52bdb5dc-4d5a-4e1b-baf4-8201b0397745](https://expo.dev/accounts/ha51b72/projects/famwallet-frontend/builds/52bdb5dc-4d5a-4e1b-baf4-8201b0397745)**

**Github link: [https://github.com/Hasib072/FamWallet](https://github.com/Hasib072/FamWallet)**
**Backend link: [https://famwallet.onrender.com](https://famwallet.onrender.com)**


## Features

-   Member Contribution Analysis: Calculate each family member's contribution to total expenses and identify the highest spender.
    
-   Savings Optimization: Suggest savings percentages based on income, expenses, and dependents, and determine if a family is overspending or underspending relative to an ideal expense-to-income ratio.
    
-   Transaction Management: Add and store transactions with details like category, amount, date, and mode of payment.
    
-   Family Management: Create family groups and manage members within the family.
    
-   User Authentication: Secure user registration and login with JWT authentication.

## Backend Overview

The backend is built with Node.js and Express, utilizing MongoDB for data storage. It provides a RESTful API for the frontend to interact with, handling user authentication, transaction management, and financial analytics.

### Deployed Backend

The backend is deployed at: [https://famwallet.onrender.com](https://famwallet.onrender.com)

### Technologies Used

-   Node.js
-   Express.js
-   MongoDB & Mongoose
-   JWT Authentication

## Frontend Overview

The frontend is a mobile application built with React Native and Expo Go. It provides a user-friendly interface for users to view their financial dashboards and manage transactions.

### Technologies Used

-   React Native
-   Expo Go

## Project Structure

The project is structured as follows:

```
FamWallet/
├── .env                # Backend environment variables (ignored in version control)
├── .gitignore
├── app.js              # Entry point for the backend server
├── config/
│   └── db.js           # Database configuration
├── controllers/
│   ├── analyticsController.js
│   ├── authController.js
│   ├── familyController.js
│   ├── transactionController.js
│   ├── userController.js
│   └── userFinanceController.js
├── famwallet-frontend/ # Frontend application directory
│   ├── .env            # Frontend environment variables (ignored in version control)
│   ├── .gitignore
│   ├── app/
│   │   ├── addBankAccount.tsx
│   │   ├── addCreditCard.tsx
│   │   ├── addtransaction.tsx
│   │   ├── components/
│   │   │   ├── AccountCard.tsx
│   │   │   ├── AccountEditModal.tsx
│   │   │   ├── AccountSection.tsx
│   │   │   ├── CashEditModal.tsx
│   │   │   ├── CashSection.tsx
│   │   │   ├── CreateFamily.tsx
│   │   │   ├── FamilySection.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── SplashScreen.tsx
│   │   │   └── TransactionCardSection.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── home.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── mytransactions.tsx
│   │   ├── signup.tsx
│   │   ├── types/
│   │   │   ├── FamilySection.ts
│   │   │   ├── navigation.d.ts
│   │   │   ├── Transaction.ts
│   │   │   ├── TransactionCardSection.ts
│   │   │   ├── User.ts
│   │   │   └── UserFinance.ts
│   │   ├── utils/
│   │   │   └── transactionUtils.ts
│   │   └── _layout.tsx
│   ├── app.json
│   ├── assets/
│   │   ├── fonts/
│   │   │   └── SpaceMono-Regular.ttf
│   │   └── images/
│   │       ├── adaptive-icon.png
│   │       ├── favicon.png
│   │       ├── icon.png
│   │       ├── splash-icon.png
│   ├── eas.json
│   ├── package.json
│   └── tsconfig.json
├── middleware/
│   ├── auth.js
│   └── role.js
├── models/
│   ├── Dependent.js
│   ├── Family.js
│   ├── Transaction.js
│   ├── User.js
│   └── UserFinance.js
├── package.json
├── README.md           # Project documentation (you're reading this!)
└── routes/
    ├── analyticsRoutes.js
    ├── api.js
    ├── familyRoutes.js
    ├── transactionRoutes.js
    ├── userFinanceRoutes.js
    └── userRoutes.js

```

## Getting Started

### Requirements

-   **Backend Requirements:**
    
    -   Node.js (version 14 or higher)
    -   MongoDB database (local or cloud instance)
    -   npm (Node Package Manager)
-   **Frontend Requirements:**
    
    -   Node.js
    -   Expo CLI (`npm install -g expo-cli`)
    -   Expo Go app installed on your mobile device (available on App Store and Google Play)

### Backend Setup

1.  **Clone the Repository**
```
git clone https://github.com/Hasib072/FamWallet.git
cd FamWallet
```
2. **Install Dependencies**
```
npm install
```
3. **Configure Environment Variables**

Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
4. **Run the Server**
```
npm run dev
```

### Frontend Setup
-   **Navigate to the Frontend Directory**
    
    bash
    
    Copy code
```
 cd famwallet-frontend
```

    
-   **Install Dependencies**
    
  ```
 npm install
```
    
-   **Configure Environment Variables**
    
    Create a `.env` file in the frontend directory with the following variable:
```
    EXPO_PUBLIC_BACKEND_URL=https://famwallet.onrender.com
```
   -   If you're running the backend locally, set `EXPO_PUBLIC_BACKEND_URL` to `http://localhost:5000`.
    
-   **Run the App**
    ```
    expo start
    ```
    
-   **Test on Device**
    
    -   Install the **Expo Go** app on your mobile device.
    -   Scan the QR code displayed in the terminal or browser after running `expo start`.


## BACKEND

### 📄 API Documentation

#### 1. **Register a New User**

-   **URL:** `/api/users/register`
-   **Method:** `POST`
-   **Access:** `Public`
-   **Description:** Registers a new user by creating a user account with the provided details.
-   **Headers:**
    -   `Content-Type: application/json`
-   **Fields:**
    -   `name` (String, **Required**): Full name of the user.
    -   `email` (String, **Required**): Valid email address of the user.
    -   `mobileNumber` (String, **Required**): Valid mobile phone number of the user.
    -   `password` (String, **Required**): Password with a minimum of 6 characters.
    -   `dateOfBirth` (Date, _Optional_): User's date of birth (ISO 8601 format).
    -   `gender` (String, _Optional_): Gender of the user. Acceptable values: `Male`, `Female`, `Other`.

----------

#### 2. **Authenticate User and Get Token**

-   **URL:** `/api/users/login`
-   **Method:** `POST`
-   **Access:** `Public`
-   **Description:** Authenticates a user using their email or mobile number along with the password. Returns a JSON Web Token (JWT) upon successful authentication.
-   **Headers:**
    -   `Content-Type: application/json`
-   **Fields:**
    -   `identifier` (String, **Required**): User's email address or mobile number.
    -   `password` (String, **Required**): User's password.

----------

#### 3. **Get Current Authenticated User's Profile**

-   **URL:** `/api/users/profile`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Retrieves the profile details of the currently authenticated user.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Request Parameters:** None

----------

#### 4. **Get User by ID**

-   **URL:** `/api/users/:id`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Retrieves the profile details of a user specified by their unique ID.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `id` (String, **Required**): Unique identifier of the user.

----------

#### 5. **Get User's Financial Details**

-   **URL:** `/api/finance`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Retrieves the financial details of the currently authenticated user, including bank accounts, cash amounts, credit cards, saving goals, and loans.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Request Parameters:** None

----------

#### 6. **Update User's Financial Details**

-   **URL:** `/api/finance`
-   **Method:** `PUT`
-   **Access:** `Private`
-   **Description:** Updates the financial details of the authenticated user. Users can update their monthly income, bank accounts, cash amounts, credit cards, saving goals, and loans.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Fields:**
    -   `monthlyIncome` (Number, _Optional_): Updated monthly income. Must be a number greater than 0.
    -   `bankAccounts` (Array, _Optional_): Array of bank account objects. Each object can include:
        -   `name` (String, _Optional_): Name of the bank account.
        -   `balance` (Number, _Optional_): Balance of the bank account.
    -   `cashAmount` (Number, _Optional_): Updated cash amount. Must be a number greater than 0.
    -   `creditCards` (Array, _Optional_): Array of credit card objects. Each object can include:
        -   `name` (String, _Optional_): Name of the credit card.
        -   `limit` (Number, _Optional_): Credit limit of the credit card.
        -   `balance` (Number, _Optional_): Current balance of the credit card.
    -   `savingGoals` (Array, _Optional_): Array of saving goal objects. Each object can include:
        -   `name` (String, _Optional_): Name of the saving goal.
        -   `targetAmount` (Number, _Optional_): Target amount for the saving goal.
        -   `currentAmount` (Number, _Optional_): Current amount saved towards the goal.
        -   `deadline` (Date, _Optional_): Deadline for achieving the saving goal.
    -   `loans` (Array, _Optional_): Array of loan objects. Each object can include:
        -   `name` (String, _Optional_): Name of the loan.
        -   `principalAmount` (Number, _Optional_): Principal amount of the loan.
        -   `interestRate` (Number, _Optional_): Interest rate of the loan.
        -   `monthlyPayment` (Number, _Optional_): Monthly payment amount.
        -   `remainingBalance` (Number, _Optional_): Remaining balance of the loan.

----------

#### 7. **Add a New Transaction**

-   **URL:** `/api/transactions`
-   **Method:** `POST`
-   **Access:** `Private`
-   **Description:** Creates a new financial transaction for the authenticated user and updates the corresponding financial balances based on the transaction mode (`Cash`, `Bank`, or `Credit Card`).
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Fields:**
    -   `familyId` (String, _Optional_): ID of the family group associated with the transaction. Must be a valid MongoDB ObjectId if provided.
    -   `type` (String, **Required**): Type of transaction. Acceptable values: `Credit`, `Debit`.
    -   `category` (String, **Required**): Category of the transaction (e.g., Groceries, Utilities).
    -   `subCategory` (String, _Optional_): Sub-category of the transaction (e.g., Supermarket, Electricity).
    -   `amount` (Number, **Required**): Amount involved in the transaction. Must be a number greater than 0.
    -   `mode` (String, **Required**): Mode of transaction. Acceptable values: `Cash`, `Bank`, `Credit Card`.
    -   `date` (Date, **Required**): Date of the transaction in ISO 8601 format.
    -   `description` (String, _Optional_): Description or notes about the transaction.
    -   `accountName` (String, _Conditionally Required_): Required if `mode` is `Bank`. Name of the bank account to debit or credit.
    -   `creditCardName` (String, _Conditionally Required_): Required if `mode` is `Credit Card`. Name of the credit card to debit or credit.

----------

#### 8. **Get All Transactions for a User**

-   **URL:** `/api/transactions/user/:userId`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Retrieves all transactions associated with a specific user. Only the user themselves or users with appropriate permissions can access this data.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `userId` (String, **Required**): Unique identifier of the user.

----------

#### 9. **Get All Transactions for a Family**

-   **URL:** `/api/transactions/family/:familyId`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Retrieves all transactions associated with a specific family group. Only members of the family can access this data.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `familyId` (String, **Required**): Unique identifier of the family group.

----------

#### 10. **Create a New Family Group**

-   **URL:** `/api/families`
-   **Method:** `POST`
-   **Access:** `Private`
-   **Description:** Creates a new family group and assigns the creator as the Admin member.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Fields:**
    -   `name` (String, **Required**): Name of the family group.

----------

#### 11. **Add a Member to a Family**

-   **URL:** `/api/families/:familyId/members`
-   **Method:** `POST`
-   **Access:** `Private`
-   **Description:** Adds a new member to the specified family using either their email or mobile number. Only Admins can add members.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `familyId` (String, **Required**): Unique identifier of the family.
-   **Fields:**
    -   `email` (String, _Optional_): Email address of the user to be added as a family member. Must be a valid email format if provided.
    -   `mobileNumber` (String, _Optional_): Mobile number of the user to be added as a family member. Must be a valid mobile phone number if provided.
-   **Note:** At least one of `email` or `mobileNumber` must be provided.

----------

#### 12. **Get Family Details**

-   **URL:** `/api/families/:familyId`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Retrieves detailed information about a specific family, including its members.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `familyId` (String, **Required**): Unique identifier of the family.

----------

#### 13. **Get All Family Members**

-   **URL:** `/api/families/:familyId/members`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Retrieves a list of all members within a specific family group.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `familyId` (String, **Required**): Unique identifier of the family.

----------

#### 14. **Member Contribution Analysis**

-   **URL:** `/api/analytics/family/:familyId/contributions`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Analyzes and reports the contribution of each family member towards the total expenses of the family. Identifies the highest spender.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `familyId` (String, **Required**): Unique identifier of the family.

----------

#### 15. **Savings Optimization Logic**

-   **URL:** `/api/analytics/family/:familyId/savings`
-   **Method:** `GET`
-   **Access:** `Private`
-   **Description:** Provides savings optimization suggestions based on the family's total income, total savings, and total expenses. Calculates ideal and actual expense-to-income ratios and suggests saving percentages.
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
    -   `Content-Type: application/json`
-   **Path Parameters:**
    -   `familyId` (String, **Required**): Unique identifier of the family.

----------

### 📝 **Summary of Requirements**

-   **Authentication Tokens:**
    
    -   **Private Routes:** Require a valid JWT token in the `Authorization` header in the format `Bearer <token>`.
-   **Request Bodies:**
    
    -   **Register a New User (`POST /api/users/register`):**
        
        -   **Required:** `name`, `email`, `mobileNumber`, `password`
        -   **Optional:** `dateOfBirth`, `gender`
    -   **Authenticate User and Get Token (`POST /api/users/login`):**
        
        -   **Required:** `identifier` (email or mobile number), `password`
    -   **Get Current Authenticated User's Profile (`GET /api/users/profile`):**
        
        -   **No Body Parameters**
    -   **Get User by ID (`GET /api/users/:id`):**
        
        -   **No Body Parameters**
    -   **Get User's Financial Details (`GET /api/finance`):**
        
        -   **No Body Parameters**
    -   **Update User's Financial Details (`PUT /api/finance`):**
        
        -   **Optional Fields:**
            -   `monthlyIncome` (Number)
            -   `bankAccounts` (Array of Objects)
            -   `cashAmount` (Number)
            -   `creditCards` (Array of Objects)
            -   `savingGoals` (Array of Objects)
            -   `loans` (Array of Objects)
    -   **Add a New Transaction (`POST /api/transactions`):**
        
        -   **Required:**
            -   `type` (`Credit` or `Debit`)
            -   `category` (String)
            -   `amount` (Number > 0)
            -   `mode` (`Cash`, `Bank`, or `Credit Card`)
            -   `date` (ISO 8601 Date)
        -   **Conditionally Required:**
            -   `accountName` (String) if `mode` is `Bank`
            -   `creditCardName` (String) if `mode` is `Credit Card`
        -   **Optional:**
            -   `subCategory` (String)
            -   `description` (String)
            -   `familyId` (String, valid MongoDB ObjectId)
    -   **Get All Transactions for a User (`GET /api/transactions/user/:userId`):**
        
        -   **Path Parameter:**
            -   `userId` (String, valid MongoDB ObjectId)
    -   **Get All Transactions for a Family (`GET /api/transactions/family/:familyId`):**
        
        -   **Path Parameter:**
            -   `familyId` (String, valid MongoDB ObjectId)
    -   **Create a New Family Group (`POST /api/families`):**
        
        -   **Required:** `name` (String)
    -   **Add a Member to a Family (`POST /api/families/:familyId/members`):**
        
        -   **Required:** At least one of `email` or `mobileNumber`
        -   **Optional:**
            -   `email` (String) - Must be a valid email format if provided.
            -   `mobileNumber` (String) - Must be a valid mobile phone number if provided.
    -   **Get Family Details (`GET /api/families/:familyId`):**
        
        -   **No Body Parameters**
    -   **Get All Family Members (`GET /api/families/:familyId/members`):**
        
        -   **No Body Parameters**
    -   **Member Contribution Analysis (`GET /api/analytics/family/:familyId/contributions`):**
        
        -   **No Body Parameters**
    -   **Savings Optimization Logic (`GET /api/analytics/family/:familyId/savings`):**
        
        -   **No Body Parameters**

----------

### 🔒 **Security Considerations**

-   **JWT Authentication:**
    
    -   Ensures that only authenticated users can access private routes.
    -   Tokens should be securely stored and transmitted over HTTPS.
-   **Role-Based Access Control:**
    
    -   Only Admin members can add new members to a family.
-   **Input Validation:**
    
    -   Utilizes `express-validator` to validate and sanitize incoming data, preventing malformed requests and potential security vulnerabilities.
-   **Error Handling:**
    
    -   Consistent and meaningful error messages are provided, aiding in debugging while avoiding leakage of sensitive information.
-   **Mongoose Transactions:**
    
    -   Ensures atomic operations when adding transactions and updating balances, maintaining data integrity.

----------

### 🛠 **Dependencies Used**

-   **bcryptjs:** For hashing passwords.
-   **jsonwebtoken:** For creating and verifying JWT tokens.
-   **express-validator:** For validating and sanitizing input data.
-   **dotenv:** For managing environment variables.
-   **mongoose:** For interacting with MongoDB.
-   **express:** For building the API routes.

----------

### 🚀 **Getting Started**

1.  **Clone the Repository:**
    
    ```bash
    git clone https://github.com/yourusername/famwallet-backend.git
    cd famwallet-backend
    
    ```
    
2.  **Install Dependencies:**
    
    Ensure you have all necessary packages installed.
    
    ```bash
    npm install
    
    ```
    
3.  **Configure Environment Variables:**
    
    Create a `.env` file in the root directory with the following variables:
    
    ```env
    JWT_SECRET=your_jwt_secret_key
    MONGO_URI=your_mongodb_connection_string
    
    ```
    
4.  **Run the Server:**
    
    Start your backend server.
    
    ```bash
    npm run dev
    
    ```
        

----------
