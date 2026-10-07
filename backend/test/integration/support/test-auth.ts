import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';

const KEY_ID = 'integration-test';
const JWKS_PATH = '/auth/v1/.well-known/jwks.json';

const createKeyPair = () => generateKeyPairSync('ec', { namedCurve: 'P-256' });

const trustedKeys = createKeyPair();

const base64url = (value: string | Buffer) =>
  Buffer.from(value).toString('base64url');

/**
 * Supabase の代わりに、テスト用の公開鍵を配る。
 * 本番の JwtStrategy はここから鍵を取り、署名をそのまま検証する
 */
export async function startJwksServer(): Promise<{
  url: string;
  close: () => Promise<void>;
}> {
  const jwks = JSON.stringify({
    keys: [
      {
        ...trustedKeys.publicKey.export({ format: 'jwk' }),
        kid: KEY_ID,
        alg: 'ES256',
        use: 'sig',
      },
    ],
  });

  const server = createServer((req, res) => {
    if (req.url !== JWKS_PATH) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(jwks);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}

type TokenOptions = {
  expiresInSeconds?: number;
  privateKey?: KeyObject;
};

/** Supabase が発行するものと同じ形式（ES256）の JWT を作る */
export function signToken(
  claims: { sub: string; email: string },
  {
    expiresInSeconds = 3600,
    privateKey = trustedKeys.privateKey,
  }: TokenOptions = {},
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(
    JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: KEY_ID }),
  );
  const payload = base64url(
    JSON.stringify({ ...claims, iat: now, exp: now + expiresInSeconds }),
  );
  const signature = sign('sha256', Buffer.from(`${header}.${payload}`), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });
  return `${header}.${payload}.${base64url(signature)}`;
}

/** 信頼されていない鍵で署名した JWT（偽造を想定） */
export function signTokenWithUntrustedKey(claims: {
  sub: string;
  email: string;
}): string {
  return signToken(claims, { privateKey: createKeyPair().privateKey });
}
