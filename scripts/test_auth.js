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
      identifier: 'desa@cimanggu1.desa.id',
      password: 'AdminDesa123!',
      redirect: 'false',
      csrfToken: csrfData.csrfToken
    })
  });
  
  console.log("Login Status:", loginRes.status);
  console.log("Login Cookies:", loginRes.headers.get('set-cookie'));
  const text = await loginRes.text();
  console.log("Login Body Prefix:", text.substring(0, 200));
}
test().catch(console.error);
