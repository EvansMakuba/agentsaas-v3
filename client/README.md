# React + Vite
# MERN stack application


# Client setup
1. Navigate to the client directory
cd agentsaas-v3/client

2. Install dependencies
npm install tailwindcss axios framer-motion lucide-react react react-dom react-icons react-router-dom socket.io-client

1. Start app
npm run dev



# Backend setup (Server)
1. Navigate to the server directory
cd agentsaas-v3/server

2. Install dependencies
# Production Dependencies
npm install bcryptjs body-parser cors dotenv express jsonwebtoken mongoose nodemailer socket.io validator

# Developer Dependencies (for automatic restarts during development)
npm install --save-dev nodemon

3. Configure package.json
The package.json file needs to be configured to use server.js as the main entry point and set up the start and dev scripts
Make sure your scripts section looks like this:

"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
},

4. Environment variables (.env)
Create a file named .env in the agentsaas-v3/server directory and add the secret keys and database connection string
Pick all the commented variables required in server/controllers/authController.js - they are at the bottom of the file(Remember to delete after use just so we don't get ourselves in a mess)

5. Start the development server
npm run dev - the server runs at port 5000

6. Database Access (MongoDB Atlas)
The project uses MongoDB Atlas for data storage. Here's how you can check the database state:

(i).    Log in to MongoDB Atlas:

(ii).   Navigate to the MongoDB Atlas website.

(iii).  Log in using your credentials.

(iv).   Navigate to the Clusters:

(v).    Once logged in, go to the Database section (or the Clusters view).

(vi).   Find the cluster that the MONGODB_URI connects to.

(vii).  Browse Collections:

(viii). Click the Browse Collections button for your connected cluster.

(ix).   Here you can view all the databases and collections, inspect the documents, and verify the data being stored by the application.