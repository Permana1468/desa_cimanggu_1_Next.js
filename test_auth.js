const http = require('http');

async function test() {
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const csrfData = await csrfRes.json();
  console.log("CSRF Token:", csrfData.csrfToken);

  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': csrfRes.headers.get('set-cookie') || ''
    },
    body: JSON.stringify({
      identifier: 'sensus@cimanggu1.desa.id',
      password: 'AdminSensus123!',
      redirect: 'false',
      csrfToken: csrfData.csrfToken
    })
  });
  
  console.log("Login Status:", loginRes.status);
  const text = await loginRes.text();
  console.log("Login Body Prefix:", text.substring(0, 100));
}
test().catch(console.error);
