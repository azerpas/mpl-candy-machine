/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  MetadataDelegateRole,
  TokenStandard,
  TokenStandardArgs,
  findMasterEditionPda,
  findMetadataDelegateRecordPda,
  findMetadataPda,
  getTokenStandardSerializer,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  AccountMeta,
  Amount,
  Context,
  Option,
  PublicKey,
  Serializer,
  Signer,
  TransactionBuilder,
  checkForIsWritableOverride as isWritable,
  mapAmountSerializer,
  mapSerializer,
  none,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { findCandyMachineAuthorityPda } from '../../hooked';
import {
  ConfigLineSettings,
  ConfigLineSettingsArgs,
  Creator,
  CreatorArgs,
  HiddenSettings,
  HiddenSettingsArgs,
  getConfigLineSettingsSerializer,
  getCreatorSerializer,
  getHiddenSettingsSerializer,
} from '../types';

// Accounts.
export type InitializeCandyMachineV2InstructionAccounts = {
  candyMachine: PublicKey;
  authorityPda?: PublicKey;
  authority?: PublicKey;
  payer?: Signer;
  ruleSet?: PublicKey;
  collectionMetadata?: PublicKey;
  collectionMint: PublicKey;
  collectionMasterEdition?: PublicKey;
  collectionUpdateAuthority: Signer;
  collectionDelegateRecord?: PublicKey;
  tokenMetadataProgram?: PublicKey;
  systemProgram?: PublicKey;
  sysvarInstructions?: PublicKey;
  authorizationRulesProgram?: PublicKey;
  authorizationRules?: PublicKey;
};

// Arguments.
export type InitializeCandyMachineV2InstructionData = {
  discriminator: Array<number>;
  /** Number of assets available */
  itemsAvailable: bigint;
  /** Symbol for the asset */
  symbol: string;
  /** Secondary sales royalty basis points (0-10000) */
  sellerFeeBasisPoints: Amount<'%', 2>;
  /** Max supply of each individual asset (default 0) */
  maxEditionSupply: bigint;
  /** Indicates if the asset is mutable or not (default yes) */
  isMutable: boolean;
  /** List of creators */
  creators: Array<Creator>;
  /** Config line settings */
  configLineSettings: Option<ConfigLineSettings>;
  /** Hidden setttings */
  hiddenSettings: Option<HiddenSettings>;
  tokenStandard: TokenStandard;
};

export type InitializeCandyMachineV2InstructionDataArgs = {
  /** Number of assets available */
  itemsAvailable: number | bigint;
  /** Symbol for the asset */
  symbol?: string;
  /** Secondary sales royalty basis points (0-10000) */
  sellerFeeBasisPoints: Amount<'%', 2>;
  /** Max supply of each individual asset (default 0) */
  maxEditionSupply?: number | bigint;
  /** Indicates if the asset is mutable or not (default yes) */
  isMutable?: boolean;
  /** List of creators */
  creators: Array<CreatorArgs>;
  /** Config line settings */
  configLineSettings?: Option<ConfigLineSettingsArgs>;
  /** Hidden setttings */
  hiddenSettings?: Option<HiddenSettingsArgs>;
  tokenStandard: TokenStandardArgs;
};

export function getInitializeCandyMachineV2InstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  InitializeCandyMachineV2InstructionDataArgs,
  InitializeCandyMachineV2InstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    InitializeCandyMachineV2InstructionDataArgs,
    InitializeCandyMachineV2InstructionData,
    InitializeCandyMachineV2InstructionData
  >(
    s.struct<InitializeCandyMachineV2InstructionData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['itemsAvailable', s.u64()],
        ['symbol', s.string()],
        ['sellerFeeBasisPoints', mapAmountSerializer(s.u16(), '%', 2)],
        ['maxEditionSupply', s.u64()],
        ['isMutable', s.bool()],
        ['creators', s.array(getCreatorSerializer(context))],
        [
          'configLineSettings',
          s.option(getConfigLineSettingsSerializer(context)),
        ],
        ['hiddenSettings', s.option(getHiddenSettingsSerializer(context))],
        ['tokenStandard', getTokenStandardSerializer(context)],
      ],
      { description: 'InitializeCandyMachineV2InstructionData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [67, 153, 175, 39, 218, 16, 38, 32],
        symbol: value.symbol ?? '',
        maxEditionSupply: value.maxEditionSupply ?? 0,
        isMutable: value.isMutable ?? true,
        configLineSettings: value.configLineSettings ?? none(),
        hiddenSettings: value.hiddenSettings ?? none(),
      } as InitializeCandyMachineV2InstructionData)
  ) as Serializer<
    InitializeCandyMachineV2InstructionDataArgs,
    InitializeCandyMachineV2InstructionData
  >;
}

// Instruction.
export function initializeCandyMachineV2(
  context: Pick<
    Context,
    'serializer' | 'programs' | 'eddsa' | 'identity' | 'payer'
  >,
  input: InitializeCandyMachineV2InstructionAccounts &
    InitializeCandyMachineV2InstructionDataArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplCandyMachineCore',
    'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR'
  );

  // Resolved accounts.
  const candyMachineAccount = input.candyMachine;
  const authorityPdaAccount =
    input.authorityPda ??
    findCandyMachineAuthorityPda(context, {
      candyMachine: publicKey(candyMachineAccount),
    });
  const authorityAccount = input.authority ?? context.identity.publicKey;
  const payerAccount = input.payer ?? context.payer;
  const ruleSetAccount = input.ruleSet ?? { ...programId, isWritable: false };
  const collectionMintAccount = input.collectionMint;
  const collectionMetadataAccount =
    input.collectionMetadata ??
    findMetadataPda(context, { mint: publicKey(collectionMintAccount) });
  const collectionMasterEditionAccount =
    input.collectionMasterEdition ??
    findMasterEditionPda(context, { mint: publicKey(collectionMintAccount) });
  const collectionUpdateAuthorityAccount = input.collectionUpdateAuthority;
  const collectionDelegateRecordAccount =
    input.collectionDelegateRecord ??
    findMetadataDelegateRecordPda(context, {
      mint: publicKey(collectionMintAccount),
      delegateRole: MetadataDelegateRole.Collection,
      updateAuthority: publicKey(collectionUpdateAuthorityAccount),
      delegate: publicKey(authorityPdaAccount),
    });
  const tokenMetadataProgramAccount = input.tokenMetadataProgram ?? {
    ...context.programs.getPublicKey(
      'mplTokenMetadata',
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
    ),
    isWritable: false,
  };
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    ),
    isWritable: false,
  };
  const sysvarInstructionsAccount =
    input.sysvarInstructions ??
    publicKey('Sysvar1nstructions1111111111111111111111111');
  const authorizationRulesProgramAccount = input.authorizationRulesProgram ?? {
    ...programId,
    isWritable: false,
  };
  const authorizationRulesAccount = input.authorizationRules ?? {
    ...programId,
    isWritable: false,
  };

  // Candy Machine.
  keys.push({
    pubkey: candyMachineAccount,
    isSigner: false,
    isWritable: isWritable(candyMachineAccount, true),
  });

  // Authority Pda.
  keys.push({
    pubkey: authorityPdaAccount,
    isSigner: false,
    isWritable: isWritable(authorityPdaAccount, true),
  });

  // Authority.
  keys.push({
    pubkey: authorityAccount,
    isSigner: false,
    isWritable: isWritable(authorityAccount, false),
  });

  // Payer.
  signers.push(payerAccount);
  keys.push({
    pubkey: payerAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(payerAccount, true),
  });

  // Rule Set.
  keys.push({
    pubkey: ruleSetAccount,
    isSigner: false,
    isWritable: isWritable(ruleSetAccount, false),
  });

  // Collection Metadata.
  keys.push({
    pubkey: collectionMetadataAccount,
    isSigner: false,
    isWritable: isWritable(collectionMetadataAccount, true),
  });

  // Collection Mint.
  keys.push({
    pubkey: collectionMintAccount,
    isSigner: false,
    isWritable: isWritable(collectionMintAccount, false),
  });

  // Collection Master Edition.
  keys.push({
    pubkey: collectionMasterEditionAccount,
    isSigner: false,
    isWritable: isWritable(collectionMasterEditionAccount, false),
  });

  // Collection Update Authority.
  signers.push(collectionUpdateAuthorityAccount);
  keys.push({
    pubkey: collectionUpdateAuthorityAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(collectionUpdateAuthorityAccount, true),
  });

  // Collection Delegate Record.
  keys.push({
    pubkey: collectionDelegateRecordAccount,
    isSigner: false,
    isWritable: isWritable(collectionDelegateRecordAccount, true),
  });

  // Token Metadata Program.
  keys.push({
    pubkey: tokenMetadataProgramAccount,
    isSigner: false,
    isWritable: isWritable(tokenMetadataProgramAccount, false),
  });

  // System Program.
  keys.push({
    pubkey: systemProgramAccount,
    isSigner: false,
    isWritable: isWritable(systemProgramAccount, false),
  });

  // Sysvar Instructions.
  keys.push({
    pubkey: sysvarInstructionsAccount,
    isSigner: false,
    isWritable: isWritable(sysvarInstructionsAccount, false),
  });

  // Authorization Rules Program.
  keys.push({
    pubkey: authorizationRulesProgramAccount,
    isSigner: false,
    isWritable: isWritable(authorizationRulesProgramAccount, false),
  });

  // Authorization Rules.
  keys.push({
    pubkey: authorizationRulesAccount,
    isSigner: false,
    isWritable: isWritable(authorizationRulesAccount, false),
  });

  // Data.
  const data =
    getInitializeCandyMachineV2InstructionDataSerializer(context).serialize(
      input
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
