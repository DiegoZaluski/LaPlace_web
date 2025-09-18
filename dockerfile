# Base image
FROM nginx:stable-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the contents of the current directory (where the Dockerfile is) into the container at /app
COPY . /app

# Expose port 80 (default port for Nginx) to the outside world
EXPOSE 80

# Set the command to run when the container starts
CMD ["nginx", "-g", "daemon off;"]

