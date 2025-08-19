# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install uv for fast package installation
RUN pip install uv

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# ADD THE --system FLAG HERE
RUN uv pip install --no-cache-dir -r requirements.txt --system

# Copy the rest of the application code into the container at /app
COPY . .

# The default command will be specified in docker-compose.yml