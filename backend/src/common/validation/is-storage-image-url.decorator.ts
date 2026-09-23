import { registerDecorator, ValidationOptions } from 'class-validator';
import { isStorageImageUrl, StorageBucket } from './storage-image-url.util';

export function IsStorageImageUrl(
  bucket: StorageBucket,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStorageImageUrl',
      target: object.constructor,
      propertyName,
      constraints: [bucket],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isStorageImageUrl(value, process.env.SUPABASE_URL, bucket);
        },
        defaultMessage() {
          return 'Spoteeにアップロードされた画像のみ使用できます';
        },
      },
    });
  };
}
