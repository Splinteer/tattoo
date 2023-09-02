import { Transform } from 'class-transformer';

export function TransformStringToArray(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? (value.length > 0 ? [value] : []) : value,
  );
}

export function TransformStringToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (
      typeof value === 'string' &&
      ['true', 'false'].includes(value.toLowerCase())
    ) {
      return value.toLowerCase() === 'true';
    }
    return value;
  });
}

export function TransformStringToNumber(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  );
}
