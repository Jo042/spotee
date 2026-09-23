import { isStorageImageUrl } from './storage-image-url.util';

const SUPABASE_URL = 'https://zvgymgxcmxupxhscnlfo.supabase.co';
const HOST = 'zvgymgxcmxupxhscnlfo.supabase.co';
const VALID = `https://${HOST}/storage/v1/object/public/spots/1234-abcd.jpg`;

const check = (value: unknown) =>
  isStorageImageUrl(value, SUPABASE_URL, 'spots');

describe('isStorageImageUrl', () => {
  describe('正規のURL', () => {
    it('自分の Storage の公開URLを許可する', () => {
      expect(check(VALID)).toBe(true);
    });

    it('ホスト名の大文字小文字は区別しない', () => {
      expect(
        check(
          `https://${HOST.toUpperCase()}/storage/v1/object/public/spots/a.jpg`,
        ),
      ).toBe(true);
    });

    it('クエリが付いていても許可する', () => {
      expect(check(`${VALID}?width=800`)).toBe(true);
    });
  });

  describe('別ホストへの接続を弾く', () => {
    it('サブドメインを装ったホスト（前方一致を通過する形）', () => {
      expect(check(`https://${HOST}.evil.com/x.jpg`)).toBe(false);
    });

    it('クエリにホスト名を埋め込んだURL（includes を通過する形）', () => {
      expect(check(`https://evil.com/?u=https://${HOST}/x.jpg`)).toBe(false);
    });

    it('フラグメントにホスト名を埋め込んだURL', () => {
      expect(check(`https://evil.com#https://${HOST}/x.jpg`)).toBe(false);
    });

    it('userinfo にホスト名を置いたURL（@ の前はユーザー名）', () => {
      expect(check(`https://${HOST}@evil.com/x.jpg`)).toBe(false);
    });

    it('まったく無関係なホスト', () => {
      expect(check('https://picsum.photos/800/450')).toBe(false);
    });
  });

  describe('プロトコル', () => {
    it('http は弾く', () => {
      expect(check(`http://${HOST}/storage/v1/object/public/spots/a.jpg`)).toBe(
        false,
      );
    });

    it('javascript: は弾く', () => {
      expect(check('javascript:alert(1)')).toBe(false);
    });

    it('data: は弾く', () => {
      expect(check('data:image/png;base64,iVBORw0KGgo=')).toBe(false);
    });
  });

  describe('パス', () => {
    it('Storage 以外のエンドポイントは弾く', () => {
      expect(check(`https://${HOST}/auth/v1/authorize?x=1`)).toBe(false);
    });

    it('別バケットは弾く', () => {
      expect(
        check(`https://${HOST}/storage/v1/object/public/avatars/a.jpg`),
      ).toBe(false);
    });

    it('.. でパスを遡っても弾く（new URL が正規化する）', () => {
      expect(
        check(
          `https://${HOST}/storage/v1/object/public/spots/../../../auth/v1/x`,
        ),
      ).toBe(false);
    });

    it('ルート直下は弾く', () => {
      expect(check(`https://${HOST}/a.jpg`)).toBe(false);
    });
  });

  describe('想定外の入力', () => {
    it.each([null, undefined, 123, {}, []])('%p は弾く', (value) => {
      expect(check(value)).toBe(false);
    });

    it('URLとして解釈できない文字列は弾く', () => {
      expect(check('not a url')).toBe(false);
    });

    it('空文字は弾く', () => {
      expect(check('')).toBe(false);
    });

    it('SUPABASE_URL が未設定なら、正規のURLでも弾く', () => {
      expect(isStorageImageUrl(VALID, undefined, 'spots')).toBe(false);
    });

    it('SUPABASE_URL が壊れていれば弾く', () => {
      expect(isStorageImageUrl(VALID, 'not a url', 'spots')).toBe(false);
    });
  });

  describe('バケットの指定', () => {
    const AVATAR = `https://${HOST}/storage/v1/object/public/avatars/me.jpg`;

    it('avatars を指定すればアバター用バケットのURLを許可する', () => {
      expect(isStorageImageUrl(AVATAR, SUPABASE_URL, 'avatars')).toBe(true);
    });

    it('spots を指定したときアバター用のURLは弾く', () => {
      expect(isStorageImageUrl(AVATAR, SUPABASE_URL, 'spots')).toBe(false);
    });

    it('avatars を指定したときスポット用のURLは弾く', () => {
      expect(isStorageImageUrl(VALID, SUPABASE_URL, 'avatars')).toBe(false);
    });

    it('バケット名の前方一致で別バケットを通さない（avatars-evil など）', () => {
      expect(
        isStorageImageUrl(
          `https://${HOST}/storage/v1/object/public/avatars-evil/x.jpg`,
          SUPABASE_URL,
          'avatars',
        ),
      ).toBe(false);
    });
  });
});
