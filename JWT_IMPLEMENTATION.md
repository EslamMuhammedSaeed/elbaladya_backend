# JWT Authentication Implementation

This document explains how to use the new JWT authentication system implemented in the backend.

## Overview

The backend now uses JWT (JSON Web Tokens) for authentication. All sensitive operations require a valid JWT token in the Authorization header.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Other configurations
DATABASE_URL="your-database-connection-string"
PORT=4000
NODE_ENV="development"
```

## Authentication Flow

### 1. Admin Login

Use the `adminLoginMain` mutation to authenticate:

```graphql
mutation AdminLogin($email: String!, $hashedPassword: String!) {
  adminLoginMain(email: $email, hashedPassword: $hashedPassword) {
    token
    admin {
      id
      name
      email
    }
  }
}
```

### 2. Using the Token

Include the JWT token in the Authorization header for all subsequent requests:

```
Authorization: Bearer <your-jwt-token>
```

## Protected Operations

The following operations now require authentication (use `@auth` directive):

### Queries

- `getDashboardData`
- `getVisionData`
- `getUsersData`
- `getCoursesData`
- `getStudentCoursesTimeSpentTrainingData`
- `getStudentCoursesData`
- `getTopStudentsData`
- `getAdminById`
- `getAllAdminsPaginated`
- `getAllAdminsNotPaginated`
- `getAllGroupsPaginated`
- `getAllGroups`
- `getAllStudentGroups`
- `getAllAdminGroups`
- `getStudentById`
- `getDeviceById`
- `getCourseById`
- `getStudentCourseById`
- `getAllAdmins`
- `getAllStudents`
- `getAllStudentsPaginated`
- `getAllStudentsNotPaginated`
- `getAllDevices`
- `getAllCourses`
- `getAllCoursesPaginated`
- `getAllStudentCourses`
- `getStudentCourseByStudentIdAndCourseId`
- `getAlllCertificates`
- `getCertificateById`

### Mutations

- `createAdmin`
- `updateAdmin`
- `deleteAdmin`
- `createGroup`
- `createStudent`
- `createStudentMain`
- `bulkCreateStudents`
- `bulkCreateAdmins`
- `updateStudent`
- `updateStudentMain`
- `deleteStudent`
- `studentLogout`
- `createDevice`
- `updateDevice`
- `deleteDevice`
- `createCourse`
- `updateCourse`

## Public Operations

The following operations remain public (no authentication required):

- `adminLoginMain` - Admin login
- `adminLogin` - Admin login with device
- `studentLogin` - Student login
- `studentLoginWithPhone` - Student login with phone

## Error Handling

When authentication fails, you'll receive one of these errors:

- `"Access token required"` - No Authorization header provided
- `"Invalid or expired token"` - Token is invalid or has expired
- `"Authentication required"` - Token is missing or invalid

## Security Notes

1. **JWT Secret**: Always change the default JWT_SECRET in production
2. **Token Expiration**: Tokens expire after 24 hours
3. **HTTPS**: Use HTTPS in production to protect token transmission
4. **Token Storage**: Store tokens securely on the client side

## Example Usage

### Frontend Implementation

```javascript
// Login
const loginResponse = await adminLoginMain({
  email: "admin@example.com",
  hashedPassword: "password123",
});

// Store token
localStorage.setItem("token", loginResponse.token);

// Use token in requests
const headers = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

// Make authenticated requests
const dashboardData = await getDashboardData({}, { context: { headers } });
```

### Testing with GraphQL Playground

1. Go to `http://localhost:4000/graphql`
2. Use the `adminLoginMain` mutation to get a token
3. Copy the token from the response
4. In the "HTTP HEADERS" section at the bottom, add:
   ```json
   {
     "Authorization": "Bearer <your-token>"
   }
   ```
5. Now you can test protected operations
