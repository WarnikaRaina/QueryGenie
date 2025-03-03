# Step 1: Use the official Node.js image as the base image
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Set an environment variable to indicate Docker environment
ENV DOCKER_ENV=true  

# Step 4: Copy package.json and package-lock.json (if exists) to install dependencies
COPY package*.json ./

# Debugging Step: List the contents of /usr/src/app directory to verify the files
RUN echo "Listing files in /usr/src/app:" && ls -l /usr/src/app

# Step 5: Install the dependencies
RUN npm install

# Step 6: Copy the rest of the application code
COPY . .

# Step 7: Copy the schema.sql file from the example folder into the container
COPY ./example/schema.sql /usr/src/app/example/schema.sql

# Debugging Step: List files in /usr/src/app/example to verify schema.sql was copied
RUN echo "Listing files in /usr/src/app/example:" && ls -l /usr/src/app/example

# Step 8: Expose the port your app will be running on (Render will bind to this)
EXPOSE 3000

# Step 9: Define the command to start the app
CMD ["npm", "start"]
