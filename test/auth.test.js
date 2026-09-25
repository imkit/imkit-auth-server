const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const jwtV8 = require('jsonwebtoken8');
const { createApp } = require('../app');

const SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
let server;
let base;

async function post(route, body) {
  const res = await fetch(`${base}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

before(async () => {
  server = createApp({ secret: SECRET, logRequests: false }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('sign issues an HS256 token with the posted claims and a one-year exp', async () => {
  const before = Math.floor(Date.now() / 1000);
  const { status, body } = await post('/sign', { id: 'user-1', nickname: 'Alice' });

  assert.strictEqual(status, 200);
  const header = JSON.parse(Buffer.from(body.token.split('.')[0], 'base64url'));
  assert.strictEqual(header.alg, 'HS256');
  const claims = jwt.verify(body.token, SECRET);
  assert.strictEqual(claims.id, 'user-1');
  assert.strictEqual(claims.nickname, 'Alice');
  assert.ok(Math.abs(claims.exp - (before + 365 * 24 * 3600)) <= 2);
  assert.strictEqual(new Date(body.expirationDate).getTime(), claims.exp * 1000);
});

test('verify returns the claims of a valid token', async () => {
  const token = jwt.sign({ id: 'user-2' }, SECRET);
  const { status, body } = await post('/verify', { token });

  assert.strictEqual(status, 200);
  assert.strictEqual(body.id, 'user-2');
});

test('tokens are interchangeable with jsonwebtoken 8 (the previous release)', async () => {
  const oldToken = jwtV8.sign({ id: 'legacy-user' }, SECRET);
  const fromOld = await post('/verify', { token: oldToken });
  assert.strictEqual(fromOld.status, 200);
  assert.strictEqual(fromOld.body.id, 'legacy-user');

  const { body } = await post('/sign', { id: 'new-user' });
  assert.strictEqual(jwtV8.verify(body.token, SECRET).id, 'new-user');
});

test('verify rejects tokens it should not accept with 401', async () => {
  const cases = {
    'wrong secret': jwt.sign({ id: 'x' }, 'another-secret'),
    'library default secret': jwt.sign({ id: 'x' }, 'secret'),
    expired: jwt.sign({ id: 'x', exp: Math.floor(Date.now() / 1000) - 60 }, SECRET),
    'alg none': `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from('{"id":"x"}').toString('base64url')}.`,
    'other HMAC alg': jwt.sign({ id: 'x' }, SECRET, { algorithm: 'HS512' }),
    malformed: 'not-a-jwt',
    missing: undefined,
  };
  for (const [name, token] of Object.entries(cases)) {
    const { status } = await post('/verify', token === undefined ? {} : { token });
    assert.strictEqual(status, 401, name);
  }
  assert.strictEqual((await post('/verify')).status, 401, 'no body');
});

test('refuses to start without JWT_SECRET', async () => {
  assert.throws(() => createApp({ secret: '' }), /JWT_SECRET is required/);

  const env = { ...process.env };
  delete env.JWT_SECRET;
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(__dirname, '..', 'bin', 'www')], {
      env: { ...env, PORT: '0' },
      stdio: 'ignore',
    });
    child.on('exit', resolve);
  });
  assert.strictEqual(code, 1);
});

test('the running server never writes tokens or claims to its output', async () => {
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'bin', 'www')], {
    env: { ...process.env, JWT_SECRET: SECRET, PORT: '0' },
  });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const port = await new Promise((resolve) => {
    child.stdout.on('data', () => {
      const m = output.match(/listening on (\d+)/);
      if (m) resolve(m[1]);
    });
  });
  const url = `http://127.0.0.1:${port}`;
  const call = (route, body) => fetch(`${url}${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json());

  const { token } = await call('/sign', { id: 'log-check-user', nickname: 'log-check-nick' });
  await call('/verify', { token });
  await call('/verify', { token: `${token}x` });
  child.kill('SIGTERM');
  await new Promise((resolve) => child.once('exit', resolve));

  assert.ok(output.includes('POST /verify'), 'request log is still written');
  assert.ok(!output.includes(token.split('.')[2]), 'token signature leaked');
  assert.ok(!output.includes('log-check-user'), 'claims leaked');
  assert.ok(!output.includes('log-check-nick'), 'claims leaked');
});
