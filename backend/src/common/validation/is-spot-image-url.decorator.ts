import { registerDecorator, ValidationOptions } from 'class-validator';
import { isSpotImageUrl } from './spot-image-url.util';

export function IsSpotImageUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSpotImageUrl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isSpotImageUrl(value, process.env.SUPABASE_URL);
        },
        defaultMessage() {
          return 'Spoteeにアップロードされた画像のみ使用できます';
        },
      },
    });
  };
}
