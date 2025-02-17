const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  SetNumberWrappersVisitor,
  UpdateAccountsVisitor,
  UpdateInstructionsVisitor,
  UpdateProgramsVisitor,
  SetStructDefaultValuesVisitor,
  TypeNumberNode,
  TypePublicKeyNode,
  TypeBytesNode,
  SetInstructionAccountDefaultValuesVisitor,
  TransformNodesVisitor,
  TransformDefinedTypesIntoAccountsVisitor,
  AutoSetAccountGpaFieldsVisitor,
  FlattenInstructionArgsStructVisitor,
  UnwrapTypeDefinedLinksVisitor,
  vScalar,
  vNone,
  TypeStructFieldNode,
  TypeDefinedLinkNode,
  vEnum,
  UseCustomAccountSerializerVisitor,
  UpdateDefinedTypesVisitor,
} = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = new Kinobi([
  path.join(idlDir, "candy_machine_core.json"),
  path.join(idlDir, "candy_guard.json"),
]);

// Update programs.
kinobi.update(
  new UpdateProgramsVisitor({
    candyGuard: { name: "mplCandyGuard", prefix: "Cg" },
    candyMachineCore: { name: "mplCandyMachineCore", prefix: "Cm" },
  })
);

// Transform some defined types into accounts.
kinobi.update(
  new TransformDefinedTypesIntoAccountsVisitor([
    "mintCounter",
    "allowListProof",
  ])
);

// Reusable seeds.
const candyGuardSeed = {
  kind: "variable",
  name: "candyGuard",
  description: "The address of the Candy Guard account",
  type: new TypePublicKeyNode(),
};
const candyMachineSeed = {
  kind: "variable",
  name: "candyMachine",
  description: "The address of the Candy Machine account",
  type: new TypePublicKeyNode(),
};
const userSeed = {
  kind: "variable",
  name: "user",
  description: "The address of the wallet trying to mint",
  type: new TypePublicKeyNode(),
};

// Update accounts.
kinobi.update(
  new UpdateAccountsVisitor({
    candyGuard: {
      internal: true,
      seeds: [
        { kind: "literal", value: "candy_guard" },
        {
          kind: "variable",
          name: "base",
          description:
            "The base address which the Candy Guard PDA derives from",
          type: new TypePublicKeyNode(),
        },
      ],
    },
    mintCounter: {
      size: 2,
      discriminator: { kind: "size" },
      seeds: [
        { kind: "literal", value: "mint_limit" },
        {
          kind: "variable",
          name: "id",
          description:
            "A unique identifier in the context of a Candy Machine/Candy Guard combo",
          type: new TypeNumberNode("u8"),
        },
        userSeed,
        candyGuardSeed,
        candyMachineSeed,
      ],
    },
    allowListProof: {
      size: 4,
      discriminator: { kind: "size" },
      seeds: [
        { kind: "literal", value: "allow_list" },
        {
          kind: "variable",
          name: "merkleRoot",
          description: "The Merkle Root used when verifying the user",
          type: new TypeBytesNode({ size: { kind: "fixed", bytes: 32 } }),
        },
        userSeed,
        candyGuardSeed,
        candyMachineSeed,
      ],
    },
    freezeEscrow: {
      seeds: [
        { kind: "literal", value: "freeze_escrow" },
        {
          kind: "variable",
          name: "destination",
          description: "The wallet that will eventually receive the funds",
          type: new TypePublicKeyNode(),
        },
        candyGuardSeed,
        candyMachineSeed,
      ],
    },
  })
);

// Update defined types.
kinobi.update(
  new UpdateDefinedTypesVisitor({
    candyGuardData: { delete: true },
    guardSet: { delete: true },
    group: { delete: true },
  })
);

// Update fields.
kinobi.update(
  new TransformNodesVisitor([
    {
      selector: { type: "TypeStructFieldNode", name: "tokenStandard" },
      transformer: (node) => {
        return new TypeStructFieldNode(
          node.metadata,
          new TypeDefinedLinkNode("tokenStandard", {
            dependency: "mplTokenMetadata",
          })
        );
      },
    },
    {
      selector: { type: "TypeStructFieldNode", name: "maxSupply" },
      transformer: (node) => {
        return new TypeStructFieldNode(
          { ...node.metadata, name: "maxEditionSupply" },
          node.type
        );
      },
    },
    {
      selector: { type: "TypeStructFieldNode", name: "hash" },
      transformer: (node) => {
        return new TypeStructFieldNode(
          node.metadata,
          new TypeBytesNode({ size: { kind: "fixed", bytes: 32 } })
        );
      },
    },
    {
      selector: { type: "TypeStructFieldNode", name: "merkleRoot" },
      transformer: (node) => {
        return new TypeStructFieldNode(
          node.metadata,
          new TypeBytesNode({ size: { kind: "fixed", bytes: 32 } })
        );
      },
    },
  ])
);

// Reusable PDA defaults.
const defaultsToAssociatedTokenPda = (mint = "mint", owner = "owner") => ({
  kind: "pda",
  pdaAccount: "associatedToken",
  dependency: "mplEssentials",
  seeds: {
    mint: { kind: "account", name: mint },
    owner: { kind: "account", name: owner },
  },
});
const defaultsToCandyGuardPda = (base = "base") => ({
  kind: "pda",
  pdaAccount: "candyGuard",
  dependency: "hooked",
  seeds: { base: { kind: "account", name: base } },
});
const defaultsToCandyMachineAuthorityPda = (candyMachine = "candyMachine") => ({
  kind: "pda",
  pdaAccount: "candyMachineAuthority",
  dependency: "hooked",
  seeds: { candyMachine: { kind: "account", name: candyMachine } },
});
const defaultsToMetadataPda = (mint = "mint") => ({
  kind: "pda",
  pdaAccount: "metadata",
  dependency: "mplTokenMetadata",
  seeds: { mint: { kind: "account", name: mint } },
});
const defaultsToMasterEditionPda = (mint = "mint") => ({
  kind: "pda",
  pdaAccount: "masterEdition",
  dependency: "mplTokenMetadata",
  seeds: { mint: { kind: "account", name: mint } },
});
const defaultsToCollectionAuthorityRecordPda = (
  mint = "mint",
  collectionAuthority = "collectionAuthority"
) => ({
  kind: "pda",
  pdaAccount: "collectionAuthorityRecord",
  dependency: "mplTokenMetadata",
  seeds: {
    mint: { kind: "account", name: mint },
    collectionAuthority: { kind: "account", name: collectionAuthority },
  },
});
const defaultsToMetadataDelegateRecordPda = (
  role = "Collection",
  mint = "mint",
  updateAuthority = "updateAuthority",
  delegate = "delegate"
) => ({
  kind: "pda",
  pdaAccount: "metadataDelegateRecord",
  dependency: "mplTokenMetadata",
  seeds: {
    mint: { kind: "account", name: mint },
    delegateRole: {
      kind: "value",
      value: vEnum("metadataDelegateRole", role, null, "mplTokenMetadata"),
    },
    updateAuthority: { kind: "account", name: updateAuthority },
    delegate: { kind: "account", name: delegate },
  },
});
const defaultsToSplAssociatedTokenProgram = () => ({
  kind: "program",
  program: {
    name: "splAssociatedToken",
    publicKey: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  },
});

// Automatically recognize account default values.
kinobi.update(
  new SetInstructionAccountDefaultValuesVisitor([
    {
      kind: "publicKey",
      account: /^recentSlothashes$/,
      publicKey: "SysvarS1otHashes111111111111111111111111111",
      ignoreIfOptional: true,
    },
    {
      kind: "identity",
      account: "candyMachineAuthority",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToCandyMachineAuthorityPda(),
      account: "authorityPda",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToCandyMachineAuthorityPda(),
      account: "candyMachineAuthorityPda",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToMetadataPda("collectionMint"),
      account: "collectionMetadata",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToMetadataPda("newCollectionMint"),
      account: "newCollectionMetadata",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToMetadataPda("nftMint"),
      account: "nftMetadata",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToMasterEditionPda("collectionMint"),
      account: "collectionMasterEdition",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToMasterEditionPda("newCollectionMint"),
      account: "newCollectionMasterEdition",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToMasterEditionPda("nftMint"),
      account: "nftMasterEdition",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToCollectionAuthorityRecordPda(
        "collectionMint",
        "authorityPda"
      ),
      account: "collectionAuthorityRecord",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToCollectionAuthorityRecordPda(
        "newCollectionMint",
        "authorityPda"
      ),
      account: "newCollectionAuthorityRecord",
      ignoreIfOptional: true,
    },
    {
      ...defaultsToMetadataDelegateRecordPda(
        "collection",
        "collectionMint",
        "collectionUpdateAuthority",
        "authorityPda"
      ),
      account: "collectionDelegateRecord",
      ignoreIfOptional: true,
    },
  ])
);

// Update instructions.
kinobi.update(
  new UpdateInstructionsVisitor({
    "mplCandyMachineCore.initialize": {
      name: "initializeCandyMachine",
    },
    "mplCandyGuard.initialize": {
      name: "createCandyGuard",
      internal: true,
      accounts: {
        candyGuard: { defaultsTo: { kind: "pda", dependency: "hooked" } },
      },
    },
    "mplCandyMachineCore.initializeV2": { name: "initializeCandyMachineV2" },
    "mplCandyMachineCore.mint": {
      name: "mintFromCandyMachine",
      accounts: {
        nftMintAuthority: { defaultsTo: { kind: "identity" } },
      },
    },
    "mplCandyMachineCore.mintV2": {
      name: "mintFromCandyMachineV2",
      accounts: {
        nftMint: { isSigner: "either" },
        nftMintAuthority: { defaultsTo: { kind: "identity" } },
        token: {
          defaultsTo: defaultsToAssociatedTokenPda("nftMint", "nftOwner"),
        },
        sysvarInstructions: {
          defaultsTo: {
            kind: "publicKey",
            publicKey: "Sysvar1nstructions1111111111111111111111111",
          },
        },
        splAtaProgram: { defaultsTo: defaultsToSplAssociatedTokenProgram() },
      },
    },
    "mplCandyGuard.mint": {
      internal: true,
      args: { label: "group" },
      accounts: {
        candyGuard: { defaultsTo: defaultsToCandyGuardPda("candyMachine") },
        nftMintAuthority: { defaultsTo: { kind: "identity" } },
        collectionAuthorityRecord: {
          defaultsTo: defaultsToCollectionAuthorityRecordPda(
            "collectionMint",
            "candyMachineAuthorityPda"
          ),
        },
      },
    },
    "mplCandyGuard.mintV2": {
      internal: true,
      args: { label: "group" },
      accounts: {
        candyGuard: { defaultsTo: defaultsToCandyGuardPda("candyMachine") },
        nftMint: { isSigner: "either" },
        nftMintAuthority: { defaultsTo: { kind: "identity" } },
        minter: { defaultsTo: { kind: "identity" } },
        token: {
          defaultsTo: defaultsToAssociatedTokenPda("nftMint", "minter"),
        },
        collectionDelegateRecord: {
          defaultsTo: defaultsToMetadataDelegateRecordPda(
            "collection",
            "collectionMint",
            "collectionUpdateAuthority",
            "candyMachineAuthorityPda"
          ),
        },
        splAtaProgram: { defaultsTo: defaultsToSplAssociatedTokenProgram() },
      },
    },
    "mplCandyGuard.route": {
      internal: true,
      args: { label: "group" },
      accounts: {
        candyGuard: { defaultsTo: defaultsToCandyGuardPda("candyMachine") },
      },
    },
    "mplCandyMachineCore.setCollectionV2": {
      accounts: {
        newCollectionDelegateRecord: {
          defaultsTo: defaultsToMetadataDelegateRecordPda(
            "collection",
            "newCollectionMint",
            "newCollectionUpdateAuthority",
            "authorityPda"
          ),
        },
      },
    },
    "mplCandyMachineCore.SetAuthority": { name: "SetCandyMachineAuthority" },
    "mplCandyGuard.SetAuthority": { name: "SetCandyGuardAuthority" },
    "mplCandyMachineCore.update": { name: "updateCandyMachine" },
    "mplCandyGuard.update": { name: "updateCandyGuard", internal: true },
    "mplCandyMachineCore.withdraw": { name: "deleteCandyMachine" },
    "mplCandyGuard.withdraw": { name: "deleteCandyGuard" },
  })
);

// Unwrap candyMachineData defined type but only for initialize instructions.
kinobi.update(
  new UnwrapTypeDefinedLinksVisitor([
    "initializeCandyMachine.candyMachineData",
    "initializeCandyMachineV2.candyMachineData",
  ])
);
kinobi.update(new FlattenInstructionArgsStructVisitor());

// Set struct default values.
const defaultInitialCandyMachineData = {
  symbol: vScalar(""),
  maxEditionSupply: vScalar(0),
  isMutable: vScalar(true),
  configLineSettings: vNone(),
  hiddenSettings: vNone(),
};
kinobi.update(
  new SetStructDefaultValuesVisitor({
    initializeCandyMachineInstructionData: defaultInitialCandyMachineData,
    initializeCandyMachineV2InstructionData: defaultInitialCandyMachineData,
  })
);

// Wrap numbers.
const percentAmount = { kind: "Amount", identifier: "%", decimals: 2 };
kinobi.update(
  new SetNumberWrappersVisitor({
    "candyMachineData.sellerFeeBasisPoints": percentAmount,
    "initializeCandyMachineInstructionData.sellerFeeBasisPoints": percentAmount,
    "initializeCandyMachineV2InstructionData.sellerFeeBasisPoints":
      percentAmount,
    "startDate.date": { kind: "DateTime" },
    "endDate.date": { kind: "DateTime" },
    "botTax.lamports": { kind: "SolAmount" },
    "solPayment.lamports": { kind: "SolAmount" },
    "freezeSolPayment.lamports": { kind: "SolAmount" },
  })
);

// Custom serializers.
kinobi.update(new AutoSetAccountGpaFieldsVisitor({ override: true }));
kinobi.update(
  new UseCustomAccountSerializerVisitor({
    candyMachine: { extract: true },
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
kinobi.accept(
  new RenderJavaScriptVisitor(jsDir, {
    prettier: require(path.join(clientDir, "js", ".prettierrc.json")),
    dependencyMap: {
      mplTokenMetadata: "@metaplex-foundation/mpl-token-metadata",
    },
  })
);
