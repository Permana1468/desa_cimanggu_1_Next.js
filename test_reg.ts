import { registerWarga } from './src/actions/auth';
async function test() {
  try {
    const res = await registerWarga({
      nik: "1234567890123456",
      fullName: "Test User 2",
      phoneNumber: "0812345678901",
      password: "password"
    });
    console.log("Result:", res);
  } catch (e) {
    console.error("Crash:", e);
  }
}
test();
