async function checkHealth() {
  try {
    const frontend = await fetch("http://localhost:3002");
    console.log("Frontend Status:", frontend.status);
  } catch (err) {
    console.log("Frontend Error:", err.message);
  }

  try {
    const backend = await fetch("http://127.0.0.1:4001/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    console.log("Backend Status:", backend.status);
  } catch (err) {
    console.log("Backend Error:", err.message, err.cause);
  }
}
checkHealth();
