/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  DateTime,
  DateTimeInput,
  Serializer,
  mapDateTimeSerializer,
} from '@metaplex-foundation/umi';

/** Guard that sets a specific date for the mint to stop. */
export type EndDate = { date: DateTime };

export type EndDateArgs = { date: DateTimeInput };

export function getEndDateSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<EndDateArgs, EndDate> {
  const s = context.serializer;
  return s.struct<EndDate>([['date', mapDateTimeSerializer(s.i64())]], {
    description: 'EndDate',
  }) as Serializer<EndDateArgs, EndDate>;
}
