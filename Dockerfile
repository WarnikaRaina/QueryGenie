# Step 1: Use the official Node.js image as the base image
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (if exists) to install dependencies
COPY package*.json ./

# Debugging Step: List the contents of the /usr/src/app directory to verify the files
RUN echo "Listing files in /usr/src/app:" && ls -l /usr/src/app

# Debugging Step: Output the contents of package.json to verify it was copied correctly
RUN echo "Contents of package.json:" && cat /usr/src/app/package.json

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Copy the schema.sql file from the example folder into the container
COPY example/schema.sql /usr/src/app/example/schema.sql

# Step 7: Expose the port your app will be running on (Render will bind to this)
EXPOSE 3000

# Step 8: Define the command to start the app
CMD ["npm", "start"]