/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Context, PublicKey, Serializer } from '@metaplex-foundation/umi';

/**
 * Guard that charges an amount in a specified spl-token as payment for the mint.
 *
 * List of accounts required:
 *
 * 0. `[writable]` Token account holding the required amount.
 * 1. `[writable]` Address of the ATA to receive the tokens.
 */

export type TokenPayment = {
  amount: bigint;
  mint: PublicKey;
  destinationAta: PublicKey;
};

export type TokenPaymentArgs = {
  amount: number | bigint;
  mint: PublicKey;
  destinationAta: PublicKey;
};

export function getTokenPaymentSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<TokenPaymentArgs, TokenPayment> {
  const s = context.serializer;
  return s.struct<TokenPayment>(
    [
      ['amount', s.u64()],
      ['mint', s.publicKey()],
      ['destinationAta', s.publicKey()],
    ],
    { description: 'TokenPayment' }
  ) as Serializer<TokenPaymentArgs, TokenPayment>;
}
