const BASE_URL = "http://localhost:3001";

async function runTests() {
  console.log("=== STARTING FULL END-TO-END AUDIT & WORKFLOW TEST ===");

  // 1. Sandeep Admin Login
  console.log("\n[1] Testing Sandeep Admin Login (Admin / Admin@123)...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "Admin", password: "Admin@123" }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  if (!adminLoginData.success || adminLoginData.user.role !== "ADMIN") {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
  }
  console.log("✓ Sandeep Admin login successful! Name:", adminLoginData.user.name);

  // 2. Existing Active Colleague Login (Rahul Sharma)
  console.log("\n[2] Testing Existing Active Colleague Login (Rahul Sharma 9876543210)...");
  const rahulLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "9876543210", password: "Admin@123" }),
  });
  const rahulLoginData = await rahulLoginRes.json();
  const rahulCookie = rahulLoginRes.headers.get("set-cookie");
  if (!rahulLoginData.success || rahulLoginData.user.name !== "Rahul Sharma") {
    throw new Error(`Rahul login failed: ${JSON.stringify(rahulLoginData)}`);
  }
  console.log("✓ Rahul Sharma login successful! Status:", rahulLoginData.user.status);

  // 3. Pending User Login Block (Amit Kumar)
  console.log("\n[3] Testing Pending User Login Block (Amit Kumar 9823456789)...");
  const amitRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "9823456789", password: "Admin@123" }),
  });
  const amitData = await amitRes.json();
  if (amitRes.status !== 403 || amitData.status !== "PENDING") {
    throw new Error(`Pending user was not blocked properly: ${JSON.stringify(amitData)}`);
  }
  console.log("✓ Correctly blocked pending user! Message:", amitData.message);

  // 4. Deactivated User Login Block (Vikram Verma)
  console.log("\n[4] Testing Deactivated User Login Block (Vikram Verma 9834567890)...");
  const vikramRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "9834567890", password: "Admin@123" }),
  });
  const vikramData = await vikramRes.json();
  if (vikramRes.status !== 403 || vikramData.status !== "DEACTIVATED") {
    throw new Error(`Deactivated user was not blocked properly: ${JSON.stringify(vikramData)}`);
  }
  console.log("✓ Correctly blocked deactivated user! Message:", vikramData.message);

  // 5. New User Registration Flow
  const testMobile = `99${Date.now().toString().slice(-8)}`;
  const testName = "Kavita Sen";
  const testPassword = "Kavita@123";
  console.log(`\n[5] Testing New User Registration (${testName}, Mobile: ${testMobile})...`);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      mobileNumber: testMobile,
      password: testPassword,
    }),
  });
  const regData = await regRes.json();
  if (!regData.success || regData.user.status !== "PENDING") {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }
  console.log("✓ Registration succeeded with PENDING status! User ID:", regData.user.id);

  // 6. Verify New User Cannot Log In While PENDING
  console.log("\n[6] Verifying new user cannot log in before Sandeep approves...");
  const newLoginPreApprove = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: testMobile, password: testPassword }),
  });
  const newLoginPreData = await newLoginPreApprove.json();
  if (newLoginPreApprove.status !== 403 || newLoginPreData.status !== "PENDING") {
    throw new Error(`New user was able to log in before approval! ${JSON.stringify(newLoginPreData)}`);
  }
  console.log("✓ Confirmed: New user login is blocked pending Sandeep's approval.");

  // 7. Admin Sandeep Approves the New User
  console.log("\n[7] Admin Sandeep approving the new user...");
  const approveRes = await fetch(`${BASE_URL}/api/users/${regData.user.id}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie.split(";")[0],
    },
    body: JSON.stringify({ status: "ACTIVE" }),
  });
  const approveData = await approveRes.json();
  if (!approveData.success || approveData.user.status !== "ACTIVE") {
    throw new Error(`Admin approval failed: ${JSON.stringify(approveData)}`);
  }
  console.log("✓ Sandeep approved user! New status:", approveData.user.status);

  // 8. New User Now Logs In Successfully
  console.log("\n[8] Testing login for newly approved user...");
  const newLoginPostApprove = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: testMobile, password: testPassword }),
  });
  const newLoginPostData = await newLoginPostApprove.json();
  const newColleagueCookie = newLoginPostApprove.headers.get("set-cookie");
  if (!newLoginPostData.success || newLoginPostData.user.status !== "ACTIVE") {
    throw new Error(`Post-approval login failed: ${JSON.stringify(newLoginPostData)}`);
  }
  console.log("✓ Newly approved user logged in successfully! Cookie issued.");

  // 9. Newly Approved Colleague Submits a Party Record
  console.log("\n[9] New colleague submitting a party expense...");
  const submitPartyRes = await fetch(`${BASE_URL}/api/parties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: newColleagueCookie.split(";")[0],
    },
    body: JSON.stringify({
      date: new Date().toISOString().slice(0, 10),
      hotelName: "Barbeque Nation, Indiranagar",
      amountSpent: 12500,
      remarks: "Welcome Treat & Team Lunch",
      billImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    }),
  });
  const submitPartyData = await submitPartyRes.json();
  if (!submitPartyRes.ok || !submitPartyData.success || submitPartyData.party.status !== "PENDING") {
    throw new Error(`Party submission failed: ${JSON.stringify(submitPartyData)}`);
  }
  console.log("✓ Party submitted successfully with status PENDING! Party ID:", submitPartyData.party.id);

  // 10. Admin Sandeep Reviews Pending Parties
  console.log("\n[10] Sandeep reviewing pending parties queue...");
  const pendingQueueRes = await fetch(`${BASE_URL}/api/parties/pending`, {
    headers: { Cookie: adminCookie.split(";")[0] },
  });
  const pendingQueueData = await pendingQueueRes.json();
  const foundInQueue = pendingQueueData.parties.some((p) => p.id === submitPartyData.party.id);
  if (!foundInQueue) {
    throw new Error("Submitted party not found in Sandeep's moderation queue!");
  }
  console.log(`✓ Sandeep retrieved ${pendingQueueData.parties.length} pending parties from queue.`);

  // 11. Admin Sandeep Approves the Party with Verification Remarks
  console.log("\n[11] Sandeep approving party and inspecting bill...");
  const moderateRes = await fetch(`${BASE_URL}/api/parties/${submitPartyData.party.id}/moderate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie.split(";")[0],
    },
    body: JSON.stringify({
      status: "APPROVED",
      adminRemarks: "Bill receipt matched with tax invoice. Approved by Sandeep.",
    }),
  });
  const moderateData = await moderateRes.json();
  if (!moderateData.success || moderateData.party.status !== "APPROVED") {
    throw new Error(`Party moderation failed: ${JSON.stringify(moderateData)}`);
  }
  console.log("✓ Party approved by Sandeep! Status:", moderateData.party.status);

  // 12. Check Historical Archive Timeline
  console.log("\n[12] Checking Historical Archive timeline for approved parties...");
  const archiveRes = await fetch(`${BASE_URL}/api/parties?status=APPROVED`);
  const archiveData = await archiveRes.json();
  const publishedParty = archiveData.parties.find((p) => p.id === submitPartyData.party.id);
  if (!publishedParty) {
    throw new Error("Approved party is missing from Historical Archive!");
  }
  console.log("✓ Party successfully published in Historical Archive Timeline!");
  console.log(`  - Hotel: ${publishedParty.hotelName}`);
  console.log(`  - Host: ${publishedParty.hostName}`);
  console.log(`  - Amount: ₹${publishedParty.amountSpent}`);
  console.log(`  - Sandeep's Note: "${publishedParty.adminRemarks}"`);

  console.log("\n🎉 ALL 12 AUDIT TESTS PASSED WITH 100% SUCCESS!");
}

runTests().catch((err) => {
  console.error("\n❌ TEST ERROR:", err);
  process.exit(1);
});
