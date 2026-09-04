import { POST } from "./src/app/api/v1/user/login/route";
import { GET } from "./src/app/api/v1/user/profile/route";

async function run() {
  console.log("Testing Login...");
  const loginReq = new Request("http://localhost:3000/api/v1/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test@nyaya.ai", password: "password123" })
  });
  
  try {
    const loginRes = await POST(loginReq);
    const loginJson = await loginRes.json();
    console.log("Login Status:", loginRes.status);
    console.log("Login Response:", loginJson);
  } catch (e) {
    console.error("Login Exception:", e);
  }
}

run();
