# 🔒 Secure File Sharing Platform

A full-stack secure file sharing app built with **Spring Boot** (backend) and **ReactJS + Tailwind CSS** (frontend).

---

## 📁 Project Structure

```
secure-file-sharing/
├── backend/                        ← Spring Boot app
│   └── src/main/java/com/fileshare/
│       ├── controller/             ← REST endpoints
│       │   ├── AuthController.java
│       │   ├── FileController.java
│       │   └── AdminController.java
│       ├── service/                ← Business logic
│       │   ├── AuthService.java
│       │   ├── FileService.java
│       │   └── SecureTokenService.java
│       ├── repository/             ← Database queries
│       │   ├── UserRepository.java
│       │   ├── FileMetadataRepository.java
│       │   ├── SharedFileRepository.java
│       │   └── SecureTokenRepository.java
│       ├── model/                  ← Database entities
│       │   ├── User.java
│       │   ├── FileMetadata.java
│       │   ├── SharedFile.java
│       │   └── SecureToken.java
│       ├── security/               ← JWT + Spring Security
│       │   ├── JwtAuthFilter.java
│       │   └── CustomUserDetailsService.java
│       ├── config/
│       │   └── SecurityConfig.java
│       ├── utils/
│       │   └── JwtUtils.java
│       ├── dto/                    ← Request/Response objects
│       │   ├── ApiResponse.java
│       │   └── AuthDTOs.java
│       └── exception/
│           └── GlobalExceptionHandler.java
│
├── frontend/                       ← React app
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── FileCard.js
│       │   ├── UploadModal.js
│       │   └── ProtectedRoute.js
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js
│       │   ├── MyFiles.js
│       │   └── SharedFiles.js
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   └── fileService.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── App.js
│       └── index.js
│
├── database/
│   └── schema.sql                  ← MySQL database schema
│
└── SecureFileSharing.postman_collection.json
```

---

## 🚀 Step-by-Step Run Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

---

### Step 1: Set Up MySQL Database

```sql
-- Option A: Run schema manually
mysql -u root -p < database/schema.sql

-- Option B: Just create the DB (Spring Boot auto-creates tables)
CREATE DATABASE file_sharing_db;
```

---

### Step 2: Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
# Update these lines with your MySQL credentials:
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Change this to a long random string for security:
app.jwt.secret=mySecretKeyChangeThis12345678901234567890
```

---

### Step 3: Run the Backend

```bash
cd backend

# Install dependencies and start the server
./mvnw spring-boot:run

# OR build and run the JAR
./mvnw clean package
java -jar target/secure-file-sharing-0.0.1-SNAPSHOT.jar
```

✅ Backend runs on: `http://localhost:8080`

The `/uploads` folder will be created automatically.

---

### Step 4: Run the Frontend

```bash
cd frontend

# Install npm packages
npm install

# Start development server
npm start
```

✅ Frontend runs on: `http://localhost:3000`

---

### Step 5: Test the App

1. Open `http://localhost:3000`
2. Click **Register** → Create an account
3. **Login** with your credentials
4. You'll receive a JWT token (stored in localStorage)
5. Start uploading files!

---

## 🔐 Authentication Flow (JWT)

Here is the step-by-step explanation of how JWT authentication works:

```
CLIENT                          SERVER
  |                               |
  |  POST /api/auth/login         |
  |  { email, password }  ──────► |
  |                               |  1. Find user by email in DB
  |                               |  2. BCrypt.verify(password, hash)
  |                               |  3. If match → generate JWT token
  |                               |     Token contains: email, expiry
  |                               |     Signed with secret key
  |  ◄── { token: "eyJhbG..." }  |
  |                               |
  |  (Client saves token in       |
  |   localStorage)               |
  |                               |
  |  GET /api/files/my-files      |
  |  Authorization: Bearer eyJ.. ►|
  |                               |  4. JwtAuthFilter intercepts
  |                               |  5. Extract "Bearer " prefix
  |                               |  6. Decode token with secret key
  |                               |  7. Get email from token payload
  |                               |  8. Load user from DB by email
  |                               |  9. Set user in SecurityContext
  |                               | 10. Controller runs with auth user
  |  ◄── { files: [...] }        |
```

**Token Structure (Base64 decoded):**
```json
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user@email.com", "iat": 1234567890, "exp": 1234654290 }
Signature: HMACSHA256(header + "." + payload, secret)
```

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | BCrypt (strength 10) |
| Auth Token | JWT (24hr expiry) |
| Protected APIs | Spring Security Filter Chain |
| Role-Based Access | @PreAuthorize annotations |
| File Type Validation | MIME type whitelist |
| File Size Limit | 10MB max |
| Temp Download Links | UUID tokens with 1hr expiry |
| CORS | Restricted to localhost:3000 |
| Access Control | Owner or shared-with check |

---

## 📡 Complete API Reference

### Auth Endpoints (Public)
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Create new account |
| POST | `/api/auth/login` | `{email, password}` | Login + get JWT token |

### File Endpoints (Requires JWT)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/files/upload` | Upload file (multipart) |
| GET | `/api/files/my-files` | Get your uploaded files |
| GET | `/api/files/download/{id}` | Download a file |
| GET | `/api/files/download/public?token=xxx` | Download via temp token |
| POST | `/api/files/share` | Share file with a user |
| GET | `/api/files/shared-with-me` | Files shared with you |
| POST | `/api/files/generate-link/{fileId}` | Create temp download URL |
| DELETE | `/api/files/{id}` | Delete a file |

### Admin Endpoints (Requires ROLE_ADMIN)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/admin/users` | Get all users |
| DELETE | `/api/admin/users/{id}` | Delete a user |
| PUT | `/api/admin/users/{id}/role?role=ROLE_ADMIN` | Change user role |
| GET | `/api/files/all` | Get all files |

---

## 📬 API Response Format

All responses follow this consistent format:

```json
{
  "success": true,
  "message": "Files retrieved",
  "data": { ... }
}
```

Error example:
```json
{
  "success": false,
  "message": "Access denied - you don't have permission"
}
```

---

## 🧪 Postman Testing

1. Import `SecureFileSharing.postman_collection.json` into Postman
2. The Login request **auto-saves the token** as a collection variable
3. All protected requests automatically use `{{token}}`

**Test Flow:**
1. Register a user → 200 OK
2. Login → Token auto-saved
3. Upload a file → Note the file `id`
4. Get My Files → See your file
5. Share File → Share with another user's email
6. Generate Link → Copy the URL
7. Download by Token → Paste in browser

---

## 🔧 Common Issues

**MySQL connection refused:**
```bash
# Make sure MySQL is running
sudo service mysql start
# Check credentials in application.properties
```

**CORS error in browser:**
```java
// In SecurityConfig.java, add your frontend URL:
config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
```

**File upload fails:**
```properties
# Increase limit in application.properties:
spring.servlet.multipart.max-file-size=50MB
```

**JWT expired:**
```properties
# Increase token lifetime (default 24hrs):
app.jwt.expiration=172800000  # 48 hours
```

---

## 🎯 Role Permissions Summary

| Action | ROLE_USER | ROLE_ADMIN |
|--------|-----------|------------|
| Register / Login | ✅ | ✅ |
| Upload file | ✅ | ✅ |
| View own files | ✅ | ✅ |
| Download own files | ✅ | ✅ |
| Share files | ✅ | ✅ |
| View shared files | ✅ | ✅ |
| View ALL files | ❌ | ✅ |
| Delete any file | ❌ | ✅ |
| Manage users | ❌ | ✅ |

---

## 📝 How to Create an Admin User

**Option A: Via MySQL**
```sql
UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'your@email.com';
```

**Option B: Via API (if you're already admin)**
```
PUT /api/admin/users/2/role?role=ROLE_ADMIN
Authorization: Bearer <admin_token>
```
