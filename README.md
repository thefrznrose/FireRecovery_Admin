# Big Sur Land Trust Fire Recovery Monitoring - Admin Timelapse Generation Frontend

## Overview

This repository is the frontend that the administrator (Jenny Jacox) can use to generate a timelapse from hiker uploaded images in an organized way.

There are currently many flaws that need to be addressed, which I can help with, but I encourage you to take ownership over this project and make it yours.

## Technologies Used

### Next.js

This project is built using **Next.js**, a React-based framework developed by Vercel. Next.js is widely used by industry leaders like OpenAI and Tesla due to its performance, scalability, and built-in optimizations. While it has a learning curve, it's a powerful tool, and I recommend leveraging **ChatGPT**, the **official documentation**, and **Stack Overflow** for assistance.

### TypeScript

The codebase is written in **TypeScript**, which is similar to JavaScript but includes **static type checking**. Although it requires some additional effort to write, it significantly improves debugging and code maintainability.

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

1. Create a new folder called BSLT_Admin somewhere you can easily find it, mine is in a projects folder on my desktop. You can create a new folder using the command line using the following command when your cwd is on the desktop, or just make a folder by right clicking and selecting create a new folder like a normal person.

```sh
mkdir BSLT_Admin
```

2. Change the cwd (current working directory) to the new folder by running the following command:

```sh
cd BSLT_Admin
```

3. Clone this repository into the new folder using Git (Check if you need to install using **git -v** to check the version). If installed run the following command. The HTTPS link can be found under the green code button for future reference:

```sh
git clone https://github.com/thefrznrose/FireRecovery_Admin.git
```

4. Install the node module dependencies using the following command. This will need to be done every time you install a new package:

```sh
yarn install
```

5. At this point you should be able to start a development server where you can update the code and see changes in real time (pretty awesome I know):

```sh
yarn run dev
```

6. Once run, you can open the webpage running on your local machine (the server in this case) by opening up a web browser of your choice and going to the **localhost:3000** url, or by **ctrl+leftClicking** on the local host link in the command line. Make sure to close the running server using **ctrl+c** before you close the command line, or else the process will be running on that port indefinitely until you manually kill it by first finding the process ID and terminating it, which is a big pain in the butt just like everything else in life:

```sh
localhost:3000
```

7. At this point you should see the web page running, but it will not have any pictures or allow you to login because the environment variables were not uploaded in the github repo for security reason. These environment variables include a google client ID, google API key, and Google Cleint Secret. If you require this file you can either create your own **.env.local** at the root directory and add your own Google Cloud Console information, but the easier way is to contact me at shaunrose831@gmail.com or 831-710-8120 and I will send the file, which you can then copy paste into the root directory of this project.

```sh
shaunrose831@gmail.com
```

# Deployment:
