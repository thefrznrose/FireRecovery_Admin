# Big Sur Land Trust Fire Recovery Monitoring - Admin Timelapse Generation Frontend

## Overview

This repository contains the frontend for **administrators** (such as Jenny Jacox) to generate timelapses from hiker-uploaded images in an organized manner.

The project is functional but requires improvements. If you're working on it, I encourage you to **take ownership** and refine it to enhance usability and performance.

---

## Technologies Used

### **Next.js**

This project is built using **Next.js**, a React-based framework developed by Vercel. It is widely adopted by companies such as OpenAI and Tesla due to its **performance, scalability, and built-in optimizations**.

For learning resources, refer to:

- [Next.js Documentation](https://nextjs.org/docs)
- [Stack Overflow](https://stackoverflow.com/)
- [ChatGPT](https://chat.openai.com/)

### **TypeScript**

The codebase is written in **TypeScript**, an extension of JavaScript that adds static type checking. While it requires some overhead, it improves **code maintainability and debugging**.

### Yarn

Instead of using **npm (Node Package Manager)**, this project uses **Yarn** (Yet Another Resource Negotiator) as the package manager. To install Yarn, first install node if you have yet to do so already (check by running **node -v** to see the version), then run the following node command:

```sh
npm install -g yarn
```

## Mantine

Mantine is the UI library being used to import components to be used in the project. Mantine allows for easy styling and good looking components with little work.

## Google Cloud Authentication

Google Cloud Authentication is what is being used to login with your gmail account and access your google drive and sheets

# How to Install and Run The Project:

In order to run the project you will need to use the command line and git to first clone the project onto your machine, then install the necessary dependencies, then run the project.

1. Clone the Repository. First, navigate to a directory where you want to store the project. For example, on your Desktop, create a new folder:

```sh
mkdir BSLT_Admin
cd BSLT_Admin
```

2. Then, clone the repository using Git:

```sh
git clone https://github.com/thefrznrose/FireRecovery_Admin.git
```

3. Install dependencies:

```sh
cd FireRecovery_admin\next-mantine-template
yarn install
```

4. Start the Development Server on port 3000 where you can run the project locally, update the code, and see changes in real time:

```sh
yarn run dev
```

HINT: Make sure to close the running server using **ctrl+c** before you close the command line, or else the process will be running on that port indefinitely until you manually kill it by first finding the process ID and terminating it, which is a big pain in the butt just like everything else in life:

5. Access the Application. Once the server is running, open a browser and go to the following url to access port 3000:

```sh
localhost:3000
```

At this point you should see the web page running, but it will not have any pictures or allow you to login because the environment variables were not uploaded in the github repo for security reason. These environment variables include a google client ID, google API key, and Google Cleint Secret. If you require this file you can either create your own **.env.local** at the root directory and add your own Google Cloud Console information, but the easier way is to contact me at shaunrose831@gmail.com or 831-710-8120 and I will send the file, which you can then copy paste into the root directory of this project.

```sh
shaunrose831@gmail.com
```

## Project Structure

A brief overview of the project's organization:

📂 **Pages** (`/pages/`)

- Contains **Next.js page components** for routing.
- Example: `index.tsx` (Home Page), `dashboard.tsx` (Admin Dashboard).

📂 **Components** (`/components/`)

- Reusable **UI components**, such as buttons, modals, and forms.

📂 **Context** (`/context/`)

- Manages **global state**, including authentication and user data.

📂 **Styles** (`/styles/`)

- Contains **global and component-specific CSS** files.

📂 **Public** (`/public/`)

- Stores **static assets** like images and icons.

# Deployment:
