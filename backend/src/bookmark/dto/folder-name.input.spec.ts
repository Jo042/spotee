import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FolderNameInput } from './folder-name.input';
import { FOLDER_NAME_MAX_LENGTH } from './folder-input.constants';

const toInput = (name: unknown) => plainToInstance(FolderNameInput, { name });

const messagesFor = async (name: unknown) => {
  const errors = await validate(toInput(name));
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
};

describe('FolderNameInput', () => {
  it('前後の空白を取り除く', () => {
    expect(toInput('  行きたい  ').name).toBe('行きたい');
  });

  it('通常の名前は通す', async () => {
    expect(await messagesFor('デート')).toEqual([]);
  });

  it('空文字は弾く', async () => {
    expect(await messagesFor('')).toContain('フォルダ名を入力してください');
  });

  it('空白だけの名前は弾く（取り除いた結果が空になる）', async () => {
    expect(await messagesFor('   ')).toContain('フォルダ名を入力してください');
  });

  it(`${FOLDER_NAME_MAX_LENGTH}文字ちょうどは通す`, async () => {
    expect(await messagesFor('あ'.repeat(FOLDER_NAME_MAX_LENGTH))).toEqual([]);
  });

  it(`${FOLDER_NAME_MAX_LENGTH + 1}文字は弾く`, async () => {
    expect(
      await messagesFor('あ'.repeat(FOLDER_NAME_MAX_LENGTH + 1)),
    ).toContain(
      `フォルダ名は${FOLDER_NAME_MAX_LENGTH}文字以内で入力してください`,
    );
  });

  it('上限は空白を取り除いたあとの長さで数える', async () => {
    const name = ` ${'あ'.repeat(FOLDER_NAME_MAX_LENGTH)} `;

    expect(await messagesFor(name)).toEqual([]);
  });

  it('文字列以外は弾く', async () => {
    expect(await messagesFor(123)).not.toEqual([]);
  });
});
