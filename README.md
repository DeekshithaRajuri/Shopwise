# Shopwise – E-Commerce Web Application

Shopwise is a full-stack e-commerce web application inspired by online shopping platforms. It provides a shopping experience with product browsing, cart management, discount coupons, checkout, and order processing.

🔗 **GitHub Repository:** [View Shopwise on GitHub](https://github.com/DeekshithaRajuri/Shopwise)

## 🚀 Technologies Used

- **Frontend:** React.js, JavaScript, HTML, CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **API:** REST API
- **Tools:** VS Code, npm, Git, GitHub

## ✨ Features

- User signup and login
- Product catalog and product details
- Add products to the shopping cart
- Update quantities and remove items
- Cart subtotal and total calculation
- Discount coupons
- Checkout form and order summary
- Order confirmation flow
- PostgreSQL database integration

*Features depend on the current implementation in the repository.*

## 🛒 Application Flow

Signup/Login → Browse Products → Add to Cart → Apply Coupon → Checkout → Payment Flow → Order Confirmation

## 🛠️ Run Locally

### Prerequisites

Install [Node.js](https://nodejs.org/) and [PostgreSQL](https://www.postgresql.org/).

### 1. Clone the repository

```bash
git clone https://github.com/DeekshithaRajuri/Shopwise.git
cd Shopwise
```

### 2. Install dependencies

Run `npm install` in each project directory containing a `package.json`.

### 3. Configure environment variables

Create a local `.env` file with the database settings required by the backend. Never upload passwords, API secrets, or `.env` files to GitHub.

### 4. Set up PostgreSQL

Create the database and run the project's SQL schema or setup scripts to create the required tables.

### 5. Start the application

Run the appropriate scripts from the frontend and backend `package.json` files. For a Vite frontend, the development command is commonly:

```bash
npm run dev
```

Open the local URL shown in your terminal.

## 🔐 Security

- Keep `.env` files private.
- Do not commit `node_modules`.
- Use test credentials when testing payment integrations.

## 👩‍💻 Author

**Deekshitha Rajuri**

---

⭐ If you find this project interesting, feel free to explore the repository and its source code.
