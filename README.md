# NestJS Demo Service with MongoDB Transactions

This is a demo NestJS service showcasing transactional operations with a MongoDB replica set cluster. The service includes a `UserService` and `UserTransactionalController` for managing users with transactional and non-transactional operations.

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 10 or higher
- **Docker**: Latest version with Docker Compose support
- **MongoDB**: Access to a MongoDB cluster (configured via Docker Compose)
- Administrative access to update the host file (for MongoDB cluster connectivity)
- A GitHub Personal Access Token (PAT) with `read:packages` scope for GitHub Packages

## Setup Instructions

Follow these steps to set up and run the NestJS demo service:

### 1. Configure npm Authentication for GitHub Packages

To install the local package `@leodSWLP/nestjs-data-generic` from GitHub Packages, create an `.npmrc` file in the project root with your GitHub Personal Access Token (PAT).

1. Generate a GitHub PAT:
   - Log in to [GitHub](https://github.com/).
   - Go to Settings > Developer settings > Personal access tokens > Tokens (classic).
   - Generate a new token with the `read:packages` scope (and `write:packages` if publishing).
2. Create an `.npmrc` file in the project root and add the following:

   ```plaintext
   @leodSWLP:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
   always-auth=true
   ```

   - Replace `YOUR_GITHUB_PAT` with the Personal Access Token you generated.
   - The `always-auth=true` setting ensures authentication is always required for the GitHub Package Registry.

   **Example**:

   ```plaintext
   @leodSWLP:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   always-auth=true
   ```

   **Note**: Keep the `.npmrc` file secure and do not commit it to version control. Add it to `.gitignore` to prevent accidental exposure.

### 2. Install Dependencies

Install the required Node.js dependencies using npm.

```bash
npm install
```

If you encounter high-severity vulnerabilities, run the following to fix them:

```bash
npm audit fix
```

If issues persist, manually update vulnerable packages or refer to the npm audit report for guidance.

### 3. Start the MongoDB Cluster

The service requires a MongoDB replica set cluster to enable transactions. Use Docker Compose to start the cluster.

1. Ensure you have a `docker-compose.yml` file configured for a MongoDB replica set (example configuration provided below).
2. Run the following command to start the MongoDB cluster in detached mode:

   ```bash
   docker-compose up -d
   ```

### 4. Update Host File

The MongoDB cluster requires specific hostnames (`mongo1`, `mongo2`) for connectivity, as it checks domain names and won't work with `127.0.0.1` or `localhost`.

1. Edit your system's host file:
   - **Linux/macOS**: `/etc/hosts`
   - **Windows**: `C:\Windows\System32\drivers\etc\hosts`
2. Add the following entries:

   ```plaintext
   127.0.0.1 mongo1
   127.0.0.1 mongo2
   ```

   **Note**: Administrative privileges are required to edit the host file. On Linux/macOS, use `sudo nano /etc/hosts`. On Windows, open Notepad as Administrator.

3. Save the changes and verify connectivity by pinging `mongo1` and `mongo2`:

   ```bash
   ping mongo1
   ping mongo2
   ```

### 5. Start the NestJS Service

Start the NestJS application in development mode:

```bash
npm run start:dev
```

This launches the service with hot-reloading enabled. The application should connect to the MongoDB cluster and be accessible at `http://localhost:3000` (or the port configured in your `main.ts` or `app.module.ts`).

## API Endpoints

Open `http://localhost:3000/docs` in your browser to view the interactive API documentation.
The service provides the following endpoints for testing transactional and non-transactional operations:

- **GET `/mongo-test/transactions/users`**  
  Lists all users in the MongoDB collection. Use this to verify the database state after operations.

- **POST `/mongo-test/transactions/users/add-and-update-user-without-tx-success`**  
  Creates and updates a user non-transactionally (changes persist).

- **POST `/mongo-test/transactions/users/add-and-update-user-without-tx-error`**  
  Creates a user non-transactionally, throws an error (user persists despite the error).

- **POST `/mongo-test/transactions/users/add-and-update-user-with-tx`**  
  Creates and updates a user transactionally (changes commit if no error).

- **POST `/mongo-test/transactions/users/create-and-update-user-join-tx`**  
  Creates a user using a transactional sub-method and updates it (changes commit).

- **POST `/mongo-test/transactions/users/create-and-update-user-join-tx-throw-error`**  
  Creates and updates a user transactionally, then throws an error (changes roll back).

- **POST `/mongo-test/transactions/users/create-before-tx-and-error`**  
  Creates a user non-transactionally, then creates and updates users transactionally before throwing an error (non-transactional user persists, transactional changes roll back).

- **POST `/mongo-test/transactions/users/reset`**  
  Deletes all users in the collection to reset the database.

## Testing the Service

1. Reset the database before testing:

   ```bash
   curl -X POST http://localhost:3000/mongo-test/transactions/users/reset
   ```

2. Test the edge case for non-transactional and transactional operations:

   ```bash
   curl -X POST http://localhost:3000/mongo-test/transactions/users/create-before-tx-and-error
   ```

3. Verify the database state (should only show the non-transactional user):

   ```bash
   curl http://localhost:3000/mongo-test/transactions/users
   ```

4. Explore the API using Swagger:
   - Open `http://localhost:3000/docs` in your browser to view the interactive API documentation.

## Troubleshooting

- **npm Install Fails**: Ensure your `.npmrc` file has a valid GitHub PAT with `read:packages` scope and `always-auth=true`. Run `npm cache clean --force` and retry `npm install`. Verify the package `@leodSWLP/nestjs-data-generic` is accessible in the GitHub Package Registry.
- **MongoDB Connection Issues**: Verify the host file entries (`mongo1`, `mongo2`) and ensure the Docker Compose MongoDB cluster is running (`docker ps`). Check the replica set status with:
