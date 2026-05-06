const http = require('http');

const loginPayload = JSON.stringify({
  identifier: "sensus@cimanggu1.desa.id",
  password: "AdminSensus123!",
  redirect: false,
  csrfToken: "dummy"
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/callback/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginPayload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Headers:", res.headers);
    console.log("Body:", data);
  });
});

req.on('error', e => console.error(e));
req.write(loginPayload);
req.end();
