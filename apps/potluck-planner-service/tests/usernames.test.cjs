const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

require('reflect-metadata');
const { ValidationPipe } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { JwtModule } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { Test } = require('@nestjs/testing');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { DataSource } = require('typeorm');
const { AuthController } = require('../src/app/controllers/auth.controller.ts');
const { ProfileController } = require('../src/app/controllers/profile.controller.ts');
const { InitialSchema1783040000000 } = require('../src/app/migrations/initial-schema.migration.ts');
const { PotluckRolesAndDishWithdrawal1783040100000 } = require('../src/app/migrations/potluck-roles-and-dish-withdrawal.migration.ts');
const { InitialAdminUser1783040200000 } = require('../src/app/migrations/initial-admin-user.migration.ts');
const { Usernames1783040300000 } = require('../src/app/migrations/usernames.migration.ts');
const { AuthSession } = require('../src/app/models/auth-session.entity.ts');
const { User } = require('../src/app/models/user.entity.ts');
const { AuthService } = require('../src/app/services/auth.service.ts');
const { JwtStrategy } = require('../src/app/services/jwt.strategy.ts');
const { UsersService } = require('../src/app/services/users.service.ts');

test('immutable usernames and editable display names (isolated PostgreSQL schema)', async (t) => {
  const schema = `username_test_${randomUUID().replaceAll('-', '')}`;
  const password = randomUUID();
  const jwtSecret = randomUUID();
  const db = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'mydb',
    schema,
    entities: [User, AuthSession],
    synchronize: false,
  });
  await db.initialize();
  const resources = { app: null };
  t.after(async () => {
    try {
      if (resources.app) await resources.app.close();
    } finally {
      try {
        await db.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      } finally {
        await db.destroy();
      }
    }
  });
  await db.query(`CREATE SCHEMA "${schema}"`);
  const runner = db.createQueryRunner();
  await runner.connect();
  try {
    await runner.query(`SET search_path TO "${schema}"`);
    await new InitialSchema1783040000000().up(runner);
    await new PotluckRolesAndDishWithdrawal1783040100000().up(runner);
    process.env.INITIAL_ADMIN_PASSWORD = password;
    await new InitialAdminUser1783040200000().up(runner);
    await runner.query(`
      INSERT INTO "user_accounts" ("name", "name_key", "password_hash")
      VALUES ('Legacy member', 'legacy member', 'unused-test-hash')
    `);
    await new Usernames1783040300000().up(runner);
  } finally {
    await runner.release();
  }

  const module = await Test.createTestingModule({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({
        secret: jwtSecret,
        signOptions: { issuer: 'potluck-planner-api', audience: 'potluck-planner-ui' },
      }),
    ],
    controllers: [AuthController, ProfileController],
    providers: [
      AuthService, UsersService, JwtStrategy,
      { provide: ConfigService, useValue: new ConfigService({ JWT_SECRET: jwtSecret }) },
      { provide: getRepositoryToken(User), useValue: db.getRepository(User) },
      { provide: getRepositoryToken(AuthSession), useValue: db.getRepository(AuthSession) },
    ],
  }).compile();
  const app = module.createNestApplication();
  resources.app = app;
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const request = async (path, body, token, method = 'POST') => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };

  await t.test('migration assigns only Sloddervos and preserves the admin password', async () => {
    const admin = await request('/auth/login', { username: 'sLoDdErVoS', password });
    assert.equal(admin.status, 201);
    assert.equal(admin.body.user.username, 'Sloddervos');
    assert.equal(admin.body.user.name, 'Timothy Claassens');
    assert.equal(admin.body.user.role, 'admin');
    assert.equal('passwordHash' in admin.body.user, false);
    const legacy = await db.getRepository(User).findOneByOrFail({ name: 'Legacy member' });
    assert.equal(legacy.username, null);
  });

  let token;
  await t.test('registration requires a valid username and permits shared display names', async () => {
    for (const username of [undefined, '', 'spaces not allowed', 'x@y', 'a'.repeat(81)]) {
      const invalid = await request('/auth/register', { username, name: 'Shared name', password });
      assert.equal(invalid.status, 400);
    }
    const registered = await request('/auth/register', {
      username: '  Test.User_1-2  ', name: 'Shared name', password,
    });
    assert.equal(registered.status, 201);
    assert.equal(registered.body.user.username, 'Test.User_1-2');
    token = registered.body.token;
    const shared = await request('/auth/register', {
      username: 'another-user', name: 'Shared name', password,
    });
    assert.equal(shared.status, 201);
    const duplicate = await request('/auth/register', {
      username: 'test.USER_1-2', name: 'Different name', password,
    });
    assert.equal(duplicate.status, 409);
  });

  await t.test('profile updates cannot change username and display-name edits survive login', async () => {
    const forbidden = await request('/profile', {
      username: 'changed', name: 'Changed name', dietaryPreferences: [],
    }, token, 'PATCH');
    assert.equal(forbidden.status, 400);
    const updated = await request('/profile', {
      name: 'Timothy Claassens', dietaryPreferences: ['Vegetarian'],
    }, token, 'PATCH');
    assert.equal(updated.status, 200);
    assert.equal(updated.body.username, 'Test.User_1-2');
    const login = await request('/auth/login', { username: 'TEST.USER_1-2', password });
    assert.equal(login.status, 201);
    assert.equal(login.body.user.name, 'Timothy Claassens');
    assert.deepEqual(login.body.user.dietaryPreferences, ['Vegetarian']);
    const me = await request('/auth/me', undefined, token, 'GET');
    assert.equal(me.status, 200);
    assert.equal(me.body.username, 'Test.User_1-2');
    const wrongPassword = await request('/auth/login', { username: 'Test.User_1-2', password: 'wrong-password' });
    assert.equal(wrongPassword.status, 401);
    const displayNameLogin = await request('/auth/login', { username: 'Timothy', password });
    assert.equal(displayNameLogin.status, 401);
    const oldPayload = await request('/auth/login', { name: 'Test.User_1-2', password });
    assert.equal(oldPayload.status, 400);
  });

  await t.test('the database rejects case-insensitive duplicates including concurrent registrations', async () => {
    const results = await Promise.all(['Race.User', 'race.user'].map((username) =>
      request('/auth/register', { username, name: 'Race', password }),
    ));
    assert.deepEqual(results.map(({ status }) => status).sort(), [201, 409]);
  });
});
