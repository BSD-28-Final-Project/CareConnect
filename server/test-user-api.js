// Test script untuk user authentication dan profile management
// Jalankan: node test-user-api.js

const BASE_URL = "http://localhost:3000/api";
let authToken = "";
let userId = "";

// Helper function untuk HTTP request
async function apiRequest(method, endpoint, body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  }
}

// Test functions
async function testRegister() {
  console.log("\n🔵 Testing Register...");
  const result = await apiRequest("POST", "/users/register", {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "password123",
  });

  if (result && result.status === 201) {
    console.log("✅ Register Success:", result.data);
    userId = result.data.userId;
  } else {
    console.log("❌ Register Failed:", result);
  }
}

async function testLogin() {
  console.log("\n🔵 Testing Login...");
  // Gunakan email yang sudah terdaftar
  const result = await apiRequest("POST", "/users/login", {
    email: "test@example.com", // Ganti dengan email yang valid
    password: "password123",
  });

  if (result && result.status === 200) {
    console.log("✅ Login Success!");
    console.log("Token:", result.data.token);
    console.log("User:", result.data.user);
    authToken = result.data.token;
  } else {
    console.log("❌ Login Failed:", result);
  }
}

async function testGetProfile() {
  console.log("\n🔵 Testing Get Profile...");
  const result = await apiRequest("GET", "/users/profile", null, authToken);

  if (result && result.status === 200) {
    console.log("✅ Get Profile Success:", result.data);
  } else {
    console.log("❌ Get Profile Failed:", result);
  }
}

async function testUpdateProfile() {
  console.log("\n🔵 Testing Update Profile (Name)...");
  const result = await apiRequest("PUT", "/users/profile", {
    name: "Updated Test User",
  }, authToken);

  if (result && result.status === 200) {
    console.log("✅ Update Profile Success:", result.data);
  } else {
    console.log("❌ Update Profile Failed:", result);
  }
}

async function testUpdatePassword() {
  console.log("\n🔵 Testing Update Password...");
  const result = await apiRequest("PUT", "/users/profile", {
    currentPassword: "password123",
    newPassword: "newpassword456",
  }, authToken);

  if (result && result.status === 200) {
    console.log("✅ Update Password Success:", result.data);
  } else {
    console.log("❌ Update Password Failed:", result);
  }
}

async function testGetUserById() {
  console.log("\n🔵 Testing Get User by ID...");
  if (!userId) {
    console.log("⚠️ No userId available, skipping test");
    return;
  }

  const result = await apiRequest("GET", `/users/${userId}`, null, authToken);

  if (result && result.status === 200) {
    console.log("✅ Get User by ID Success:", result.data);
  } else {
    console.log("❌ Get User by ID Failed:", result);
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting User API Tests...");
  console.log("Make sure your server is running on port 3000!");

  // Uncomment tests yang mau dijalankan
  
  // await testRegister();
  // await testLogin();
  // await testGetProfile();
  // await testUpdateProfile();
  // await testUpdatePassword();
  // await testGetUserById();

  console.log("\n✅ All tests completed!");
}

// Run tests
runTests();

/* 
CARA PAKAI:
1. Pastikan server sudah running (node app.js atau npm run dev)
2. Uncomment test function yang mau dijalankan
3. Untuk test login, update, dll - pastikan sudah ada user di database
4. Jalankan: node test-user-api.js
*/
