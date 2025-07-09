type Option<T> = T | undefined;
type FixedArray<T, L> = T[];
export type AccountAddress = string;
export type AccumulatorOperation =
  | {
      Merge: boolean;
      $kind: "Merge";
    }
  | {
      Split: boolean;
      $kind: "Split";
    };
export type AccumulatorValue = {
  U64: string;
  $kind: "U64";
};
export type AccumulatorWriteV1 = {
  recipient: SuiAddress;
  accumulator_type: StructTag;
  operation: AccumulatorOperation;
  value: AccumulatorValue;
};
export type ActiveJwk = { jwk_id: JwkId; jwk: JWK; epoch: string };
export type AdditionalConsensusStateDigest = Digest;
export type Argument =
  | {
      GasCoin: boolean;
      $kind: "GasCoin";
    }
  | {
      Input: string;
      $kind: "Input";
    }
  | {
      Result: string;
      $kind: "Result";
    }
  | {
      NestedResult: [string, string];
      $kind: "NestedResult";
    };
export type AuthenticatorStateExpire = {
  min_epoch: string;
  authenticator_obj_initial_shared_version: SequenceNumber;
};
export type AuthenticatorStateUpdate = {
  epoch: string;
  round: string;
  new_active_jwks: ActiveJwk[];
  authenticator_obj_initial_shared_version: SequenceNumber;
};
export type AuthorityPublicKeyBytes = number[];
export type AuthorityQuorumSignInfo = {
  epoch: string;
  signature: FixedArray<number, 48>;
  signers_map: number[];
};
export type CallArg =
  | {
      Pure: number[];
      $kind: "Pure";
    }
  | {
      Object: ObjectArg;
      $kind: "Object";
    };
export type ChainIdentifier = CheckpointDigest;
export type ChangeEpoch = {
  epoch: string;
  protocol_version: ProtocolVersion;
  storage_charge: string;
  computation_charge: string;
  storage_rebate: string;
  non_refundable_storage_fee: string;
  epoch_start_timestamp_ms: string;
  system_packages: [SequenceNumber, number[][], ObjectID[]][];
};
export type CheckpointCommitment = {
  ECMHLiveObjectSetDigest: ECMHLiveObjectSetDigest;
  $kind: "ECMHLiveObjectSetDigest";
};
export type CheckpointContents = {
  V1: CheckpointContentsV1;
  $kind: "V1";
};
export type CheckpointContentsDigest = Digest;
export type CheckpointContentsV1 = {
  transactions: ExecutionDigests[];
  user_signatures: GenericSignature[][];
};
export type CheckpointData = {
  checkpoint_summary: sui_types__message_envelope__Envelope$_sui_types__messages_checkpoint__CheckpointSummary_$_sui_types__crypto__AuthorityQuorumSignInfo$_true_$_$;
  checkpoint_contents: CheckpointContents;
  transactions: CheckpointTransaction[];
};
export type CheckpointDigest = string;
export type CheckpointSummary = {
  epoch: string;
  sequence_number: string;
  network_total_transactions: string;
  content_digest: CheckpointContentsDigest;
  previous_digest: Option<CheckpointDigest>;
  epoch_rolling_gas_cost_summary: GasCostSummary;
  timestamp_ms: string;
  checkpoint_commitments: CheckpointCommitment[];
  end_of_epoch_data: Option<EndOfEpochData>;
  version_specific_data: number[];
};
export type CheckpointTransaction = {
  transaction: sui_types__message_envelope__Envelope$_sui_types__transaction__SenderSignedData_$_sui_types__crypto__EmptySignInfo_$;
  effects: TransactionEffects;
  events: Option<TransactionEvents>;
  input_objects: Object[];
  output_objects: Object[];
};
export type Command =
  | {
      MoveCall: ProgrammableMoveCall;
      $kind: "MoveCall";
    }
  | {
      TransferObjects: [Argument[], Argument];
      $kind: "TransferObjects";
    }
  | {
      SplitCoins: [Argument, Argument[]];
      $kind: "SplitCoins";
    }
  | {
      MergeCoins: [Argument, Argument[]];
      $kind: "MergeCoins";
    }
  | {
      Publish: [number[][], ObjectID[]];
      $kind: "Publish";
    }
  | {
      MakeMoveVec: [Option<TypeInput>, Argument[]];
      $kind: "MakeMoveVec";
    }
  | {
      Upgrade: [number[][], ObjectID[], ObjectID, Argument];
      $kind: "Upgrade";
    };
export type CommandArgumentError =
  | {
      TypeMismatch: boolean;
      $kind: "TypeMismatch";
    }
  | {
      InvalidBCSBytes: boolean;
      $kind: "InvalidBCSBytes";
    }
  | {
      InvalidUsageOfPureArg: boolean;
      $kind: "InvalidUsageOfPureArg";
    }
  | {
      InvalidArgumentToPrivateEntryFunction: boolean;
      $kind: "InvalidArgumentToPrivateEntryFunction";
    }
  | {
      IndexOutOfBounds: { idx: string };
      $kind: "IndexOutOfBounds";
    }
  | {
      SecondaryIndexOutOfBounds: { result_idx: string; secondary_idx: string };
      $kind: "SecondaryIndexOutOfBounds";
    }
  | {
      InvalidResultArity: { result_idx: string };
      $kind: "InvalidResultArity";
    }
  | {
      InvalidGasCoinUsage: boolean;
      $kind: "InvalidGasCoinUsage";
    }
  | {
      InvalidValueUsage: boolean;
      $kind: "InvalidValueUsage";
    }
  | {
      InvalidObjectByValue: boolean;
      $kind: "InvalidObjectByValue";
    }
  | {
      InvalidObjectByMutRef: boolean;
      $kind: "InvalidObjectByMutRef";
    }
  | {
      SharedObjectOperationNotAllowed: boolean;
      $kind: "SharedObjectOperationNotAllowed";
    }
  | {
      InvalidArgumentArity: boolean;
      $kind: "InvalidArgumentArity";
    };
export type CompressedSignature =
  | {
      Ed25519: FixedArray<number, 64>;
      $kind: "Ed25519";
    }
  | {
      Secp256k1: FixedArray<number, 64>;
      $kind: "Secp256k1";
    }
  | {
      Secp256r1: FixedArray<number, 64>;
      $kind: "Secp256r1";
    }
  | {
      ZkLogin: ZkLoginAuthenticatorAsBytes;
      $kind: "ZkLogin";
    };
export type CongestedObjects = ObjectID[];
export type ConsensusCommitDigest = Digest;
export type ConsensusCommitPrologue = {
  epoch: string;
  round: string;
  commit_timestamp_ms: string;
};
export type ConsensusCommitPrologueV2 = {
  epoch: string;
  round: string;
  commit_timestamp_ms: string;
  consensus_commit_digest: ConsensusCommitDigest;
};
export type ConsensusCommitPrologueV3 = {
  epoch: string;
  round: string;
  sub_dag_index: Option<string>;
  commit_timestamp_ms: string;
  consensus_commit_digest: ConsensusCommitDigest;
  consensus_determined_version_assignments: ConsensusDeterminedVersionAssignments;
};
export type ConsensusCommitPrologueV4 = {
  epoch: string;
  round: string;
  sub_dag_index: Option<string>;
  commit_timestamp_ms: string;
  consensus_commit_digest: ConsensusCommitDigest;
  consensus_determined_version_assignments: ConsensusDeterminedVersionAssignments;
  additional_state_digest: AdditionalConsensusStateDigest;
};
export type ConsensusDeterminedVersionAssignments =
  | {
      CancelledTransactions: [
        TransactionDigest,
        [ObjectID, SequenceNumber][],
      ][];
      $kind: "CancelledTransactions";
    }
  | {
      CancelledTransactionsV2: [
        TransactionDigest,
        [[ObjectID, SequenceNumber], SequenceNumber][],
      ][];
      $kind: "CancelledTransactionsV2";
    };
export type Data =
  | {
      Move: MoveObject;
      $kind: "Move";
    }
  | {
      Package: MovePackage;
      $kind: "Package";
    };
export type DeleteKind =
  | {
      Normal: boolean;
      $kind: "Normal";
    }
  | {
      UnwrapThenDelete: boolean;
      $kind: "UnwrapThenDelete";
    }
  | {
      Wrap: boolean;
      $kind: "Wrap";
    };
export type Digest = string;
export type Duration = { secs: string; nanos: string };
export type ECMHLiveObjectSetDigest = { digest: Digest };
export type EffectsAuxDataDigest = Digest;
export type EffectsObjectChange = {
  input_state: ObjectIn;
  output_state: ObjectOut;
  id_operation: IDOperation;
};
export type EmptySignInfo = {};
export type EndOfEpochData = {
  nextEpochCommittee: [AuthorityPublicKeyBytes, string][];
  nextEpochProtocolVersion: ProtocolVersion;
  epochCommitments: CheckpointCommitment[];
};
export type EndOfEpochTransactionKind =
  | {
      ChangeEpoch: ChangeEpoch;
      $kind: "ChangeEpoch";
    }
  | {
      AuthenticatorStateCreate: boolean;
      $kind: "AuthenticatorStateCreate";
    }
  | {
      AuthenticatorStateExpire: AuthenticatorStateExpire;
      $kind: "AuthenticatorStateExpire";
    }
  | {
      RandomnessStateCreate: boolean;
      $kind: "RandomnessStateCreate";
    }
  | {
      DenyListStateCreate: boolean;
      $kind: "DenyListStateCreate";
    }
  | {
      BridgeStateCreate: ChainIdentifier;
      $kind: "BridgeStateCreate";
    }
  | {
      BridgeCommitteeInit: SequenceNumber;
      $kind: "BridgeCommitteeInit";
    }
  | {
      StoreExecutionTimeObservations: StoredExecutionTimeObservations;
      $kind: "StoreExecutionTimeObservations";
    };
export type Event = {
  package_id: ObjectID;
  transaction_module: string;
  sender: SuiAddress;
  type_: StructTag;
  contents: number[];
};
export type ExecutionData = {
  transaction: sui_types__message_envelope__Envelope$_sui_types__transaction__SenderSignedData_$_sui_types__crypto__EmptySignInfo_$;
  effects: TransactionEffects;
};
export type ExecutionDigests = {
  transaction: TransactionDigest;
  effects: TransactionEffectsDigest;
};
export type ExecutionFailureStatus =
  | {
      InsufficientGas: boolean;
      $kind: "InsufficientGas";
    }
  | {
      InvalidGasObject: boolean;
      $kind: "InvalidGasObject";
    }
  | {
      InvariantViolation: boolean;
      $kind: "InvariantViolation";
    }
  | {
      FeatureNotYetSupported: boolean;
      $kind: "FeatureNotYetSupported";
    }
  | {
      MoveObjectTooBig: { object_size: string; max_object_size: string };
      $kind: "MoveObjectTooBig";
    }
  | {
      MovePackageTooBig: { object_size: string; max_object_size: string };
      $kind: "MovePackageTooBig";
    }
  | {
      CircularObjectOwnership: { object: ObjectID };
      $kind: "CircularObjectOwnership";
    }
  | {
      InsufficientCoinBalance: boolean;
      $kind: "InsufficientCoinBalance";
    }
  | {
      CoinBalanceOverflow: boolean;
      $kind: "CoinBalanceOverflow";
    }
  | {
      PublishErrorNonZeroAddress: boolean;
      $kind: "PublishErrorNonZeroAddress";
    }
  | {
      SuiMoveVerificationError: boolean;
      $kind: "SuiMoveVerificationError";
    }
  | {
      MovePrimitiveRuntimeError: MoveLocationOpt;
      $kind: "MovePrimitiveRuntimeError";
    }
  | {
      MoveAbort: [MoveLocation, string];
      $kind: "MoveAbort";
    }
  | {
      VMVerificationOrDeserializationError: boolean;
      $kind: "VMVerificationOrDeserializationError";
    }
  | {
      VMInvariantViolation: boolean;
      $kind: "VMInvariantViolation";
    }
  | {
      FunctionNotFound: boolean;
      $kind: "FunctionNotFound";
    }
  | {
      ArityMismatch: boolean;
      $kind: "ArityMismatch";
    }
  | {
      TypeArityMismatch: boolean;
      $kind: "TypeArityMismatch";
    }
  | {
      NonEntryFunctionInvoked: boolean;
      $kind: "NonEntryFunctionInvoked";
    }
  | {
      CommandArgumentError: { arg_idx: string; kind: CommandArgumentError };
      $kind: "CommandArgumentError";
    }
  | {
      TypeArgumentError: { argument_idx: string; kind: TypeArgumentError };
      $kind: "TypeArgumentError";
    }
  | {
      UnusedValueWithoutDrop: { result_idx: string; secondary_idx: string };
      $kind: "UnusedValueWithoutDrop";
    }
  | {
      InvalidPublicFunctionReturnType: { idx: string };
      $kind: "InvalidPublicFunctionReturnType";
    }
  | {
      InvalidTransferObject: boolean;
      $kind: "InvalidTransferObject";
    }
  | {
      EffectsTooLarge: { current_size: string; max_size: string };
      $kind: "EffectsTooLarge";
    }
  | {
      PublishUpgradeMissingDependency: boolean;
      $kind: "PublishUpgradeMissingDependency";
    }
  | {
      PublishUpgradeDependencyDowngrade: boolean;
      $kind: "PublishUpgradeDependencyDowngrade";
    }
  | {
      PackageUpgradeError: { upgrade_error: PackageUpgradeError };
      $kind: "PackageUpgradeError";
    }
  | {
      WrittenObjectsTooLarge: { current_size: string; max_size: string };
      $kind: "WrittenObjectsTooLarge";
    }
  | {
      CertificateDenied: boolean;
      $kind: "CertificateDenied";
    }
  | {
      SuiMoveVerificationTimedout: boolean;
      $kind: "SuiMoveVerificationTimedout";
    }
  | {
      SharedObjectOperationNotAllowed: boolean;
      $kind: "SharedObjectOperationNotAllowed";
    }
  | {
      InputObjectDeleted: boolean;
      $kind: "InputObjectDeleted";
    }
  | {
      ExecutionCancelledDueToSharedObjectCongestion: {
        congested_objects: CongestedObjects;
      };
      $kind: "ExecutionCancelledDueToSharedObjectCongestion";
    }
  | {
      AddressDeniedForCoin: { address: SuiAddress; coin_type: string };
      $kind: "AddressDeniedForCoin";
    }
  | {
      CoinTypeGlobalPause: { coin_type: string };
      $kind: "CoinTypeGlobalPause";
    }
  | {
      ExecutionCancelledDueToRandomnessUnavailable: boolean;
      $kind: "ExecutionCancelledDueToRandomnessUnavailable";
    }
  | {
      MoveVectorElemTooBig: { value_size: string; max_scaled_size: string };
      $kind: "MoveVectorElemTooBig";
    }
  | {
      MoveRawValueTooBig: { value_size: string; max_scaled_size: string };
      $kind: "MoveRawValueTooBig";
    };
export type ExecutionStatus =
  | {
      Success: boolean;
      $kind: "Success";
    }
  | {
      Failure: { error: ExecutionFailureStatus; command: Option<string> };
      $kind: "Failure";
    };
export type ExecutionTimeObservationKey =
  | {
      MoveEntryPoint: {
        package: ObjectID;
        module: string;
        function: string;
        type_arguments: TypeInput[];
      };
      $kind: "MoveEntryPoint";
    }
  | {
      TransferObjects: boolean;
      $kind: "TransferObjects";
    }
  | {
      SplitCoins: boolean;
      $kind: "SplitCoins";
    }
  | {
      MergeCoins: boolean;
      $kind: "MergeCoins";
    }
  | {
      Publish: boolean;
      $kind: "Publish";
    }
  | {
      MakeMoveVec: boolean;
      $kind: "MakeMoveVec";
    }
  | {
      Upgrade: boolean;
      $kind: "Upgrade";
    };
export type FullCheckpointContents = {
  transactions: ExecutionData[];
  user_signatures: GenericSignature[][];
};
export type GasCostSummary = {
  computationCost: string;
  storageCost: string;
  storageRebate: string;
  nonRefundableStorageFee: string;
};
export type GasData = {
  payment: [ObjectID, SequenceNumber, ObjectDigest][];
  owner: SuiAddress;
  price: string;
  budget: string;
};
export type GenericSignature = number[];
export type GenesisObject = {
  RawObject: { data: Data; owner: Owner };
  $kind: "RawObject";
};
export type GenesisTransaction = { objects: GenesisObject[] };
export type IDOperation =
  | {
      None: boolean;
      $kind: "None";
    }
  | {
      Created: boolean;
      $kind: "Created";
    }
  | {
      Deleted: boolean;
      $kind: "Deleted";
    };
export type Intent = { scope: number; version: number; app_id: number };
export type IntentMessage = { intent: Intent; value: TransactionData };
export type JWK = { kty: string; e: string; n: string; alg: string };
export type JwkId = { iss: string; kid: string };
export type ModuleId = { address: AccountAddress; name: string };
export type MoveLocation = {
  module: ModuleId;
  function: string;
  instruction: string;
  function_name: Option<string>;
};
export type MoveLocationOpt = Option<MoveLocation>;
export type MoveObject = {
  type_: MoveObjectType;
  has_public_transfer: boolean;
  version: SequenceNumber;
  contents: number[];
};
export type MoveObjectType = MoveObjectType_;
export type MoveObjectType_ =
  | {
      Other: StructTag;
      $kind: "Other";
    }
  | {
      GasCoin: boolean;
      $kind: "GasCoin";
    }
  | {
      StakedSui: boolean;
      $kind: "StakedSui";
    }
  | {
      Coin: TypeTag;
      $kind: "Coin";
    };
export type MovePackage = {
  id: ObjectID;
  version: SequenceNumber;
  module_map: Map<string, number[]>;
  type_origin_table: TypeOrigin[];
  linkage_table: Map<ObjectID, UpgradeInfo>;
};
export type MultiSig = {
  sigs: CompressedSignature[];
  bitmap: string;
  multisig_pk: MultiSigPublicKey;
};
export type MultiSigPublicKey = {
  pk_map: [PublicKey, number][];
  threshold: string;
};
export type Object = {
  data: Data;
  owner: Owner;
  previous_transaction: TransactionDigest;
  storage_rebate: string;
};
export type ObjectArg =
  | {
      ImmOrOwnedObject: [ObjectID, SequenceNumber, ObjectDigest];
      $kind: "ImmOrOwnedObject";
    }
  | {
      SharedObject: {
        id: ObjectID;
        initial_shared_version: SequenceNumber;
        mutable: boolean;
      };
      $kind: "SharedObject";
    }
  | {
      Receiving: [ObjectID, SequenceNumber, ObjectDigest];
      $kind: "Receiving";
    };
export type ObjectDigest = string;
export type ObjectID = string;
export type ObjectIn =
  | {
      NotExist: boolean;
      $kind: "NotExist";
    }
  | {
      Exist: [[SequenceNumber, ObjectDigest], Owner];
      $kind: "Exist";
    };
export type ObjectInfoRequestKind =
  | {
      LatestObjectInfo: boolean;
      $kind: "LatestObjectInfo";
    }
  | {
      PastObjectInfoDebug: SequenceNumber;
      $kind: "PastObjectInfoDebug";
    };
export type ObjectOut =
  | {
      NotExist: boolean;
      $kind: "NotExist";
    }
  | {
      ObjectWrite: [ObjectDigest, Owner];
      $kind: "ObjectWrite";
    }
  | {
      PackageWrite: [SequenceNumber, ObjectDigest];
      $kind: "PackageWrite";
    }
  | {
      AccumulatorWriteV1: AccumulatorWriteV1;
      $kind: "AccumulatorWriteV1";
    };
export type Owner =
  | {
      AddressOwner: SuiAddress;
      $kind: "AddressOwner";
    }
  | {
      ObjectOwner: SuiAddress;
      $kind: "ObjectOwner";
    }
  | {
      Shared: { initial_shared_version: SequenceNumber };
      $kind: "Shared";
    }
  | {
      Immutable: boolean;
      $kind: "Immutable";
    }
  | {
      ConsensusAddressOwner: {
        start_version: SequenceNumber;
        owner: SuiAddress;
      };
      $kind: "ConsensusAddressOwner";
    };
export type PackageUpgradeError =
  | {
      UnableToFetchPackage: { package_id: ObjectID };
      $kind: "UnableToFetchPackage";
    }
  | {
      NotAPackage: { object_id: ObjectID };
      $kind: "NotAPackage";
    }
  | {
      IncompatibleUpgrade: boolean;
      $kind: "IncompatibleUpgrade";
    }
  | {
      DigestDoesNotMatch: { digest: number[] };
      $kind: "DigestDoesNotMatch";
    }
  | {
      UnknownUpgradePolicy: { policy: number };
      $kind: "UnknownUpgradePolicy";
    }
  | {
      PackageIDDoesNotMatch: { package_id: ObjectID; ticket_id: ObjectID };
      $kind: "PackageIDDoesNotMatch";
    };
export type ProgrammableMoveCall = {
  package: ObjectID;
  module: string;
  function: string;
  type_arguments: TypeInput[];
  arguments: Argument[];
};
export type ProgrammableTransaction = {
  inputs: CallArg[];
  commands: Command[];
};
export type ProtocolVersion = string;
export type PublicKey =
  | {
      Ed25519: FixedArray<number, 32>;
      $kind: "Ed25519";
    }
  | {
      Secp256k1: FixedArray<number, 33>;
      $kind: "Secp256k1";
    }
  | {
      Secp256r1: FixedArray<number, 33>;
      $kind: "Secp256r1";
    }
  | {
      ZkLogin: ZkLoginPublicIdentifier;
      $kind: "ZkLogin";
    };
export type RandomnessRound = string;
export type RandomnessStateUpdate = {
  epoch: string;
  randomness_round: RandomnessRound;
  random_bytes: number[];
  randomness_obj_initial_shared_version: SequenceNumber;
};
export type SenderSignedData = SenderSignedTransaction[];
export type SenderSignedTransaction = {
  intent_message: IntentMessage;
  tx_signatures: GenericSignature[];
};
export type SequenceNumber = string;
export type StoredExecutionTimeObservations = {
  V1: [ExecutionTimeObservationKey, [AuthorityPublicKeyBytes, Duration][]][];
  $kind: "V1";
};
export type StructInput = {
  address: AccountAddress;
  module: string;
  name: string;
  type_args: TypeInput[];
};
export type StructTag = {
  address: AccountAddress;
  module: string;
  name: string;
  type_args: TypeTag[];
};
export type SuiAddress = string;
export type TransactionData = {
  V1: TransactionDataV1;
  $kind: "V1";
};
export type TransactionDataV1 = {
  kind: TransactionKind;
  sender: SuiAddress;
  gas_data: GasData;
  expiration: TransactionExpiration;
};
export type TransactionDigest = Digest;
export type TransactionEffects =
  | {
      V1: TransactionEffectsV1;
      $kind: "V1";
    }
  | {
      V2: TransactionEffectsV2;
      $kind: "V2";
    };
export type TransactionEffectsDigest = Digest;
export type TransactionEffectsV1 = {
  status: ExecutionStatus;
  executed_epoch: string;
  gas_used: GasCostSummary;
  modified_at_versions: [ObjectID, SequenceNumber][];
  shared_objects: [ObjectID, SequenceNumber, ObjectDigest][];
  transaction_digest: TransactionDigest;
  created: [[ObjectID, SequenceNumber, ObjectDigest], Owner][];
  mutated: [[ObjectID, SequenceNumber, ObjectDigest], Owner][];
  unwrapped: [[ObjectID, SequenceNumber, ObjectDigest], Owner][];
  deleted: [ObjectID, SequenceNumber, ObjectDigest][];
  unwrapped_then_deleted: [ObjectID, SequenceNumber, ObjectDigest][];
  wrapped: [ObjectID, SequenceNumber, ObjectDigest][];
  gas_object: [[ObjectID, SequenceNumber, ObjectDigest], Owner];
  events_digest: Option<TransactionEventsDigest>;
  dependencies: TransactionDigest[];
};
export type TransactionEffectsV2 = {
  status: ExecutionStatus;
  executed_epoch: string;
  gas_used: GasCostSummary;
  transaction_digest: TransactionDigest;
  gas_object_index: Option<string>;
  events_digest: Option<TransactionEventsDigest>;
  dependencies: TransactionDigest[];
  lamport_version: SequenceNumber;
  changed_objects: [ObjectID, EffectsObjectChange][];
  unchanged_shared_objects: [ObjectID, UnchangedSharedKind][];
  aux_data_digest: Option<EffectsAuxDataDigest>;
};
export type TransactionEvents = { data: Event[] };
export type TransactionEventsDigest = Digest;
export type TransactionExpiration =
  | {
      None: boolean;
      $kind: "None";
    }
  | {
      Epoch: string;
      $kind: "Epoch";
    };
export type TransactionKind =
  | {
      ProgrammableTransaction: ProgrammableTransaction;
      $kind: "ProgrammableTransaction";
    }
  | {
      ChangeEpoch: ChangeEpoch;
      $kind: "ChangeEpoch";
    }
  | {
      Genesis: GenesisTransaction;
      $kind: "Genesis";
    }
  | {
      ConsensusCommitPrologue: ConsensusCommitPrologue;
      $kind: "ConsensusCommitPrologue";
    }
  | {
      AuthenticatorStateUpdate: AuthenticatorStateUpdate;
      $kind: "AuthenticatorStateUpdate";
    }
  | {
      EndOfEpochTransaction: EndOfEpochTransactionKind[];
      $kind: "EndOfEpochTransaction";
    }
  | {
      RandomnessStateUpdate: RandomnessStateUpdate;
      $kind: "RandomnessStateUpdate";
    }
  | {
      ConsensusCommitPrologueV2: ConsensusCommitPrologueV2;
      $kind: "ConsensusCommitPrologueV2";
    }
  | {
      ConsensusCommitPrologueV3: ConsensusCommitPrologueV3;
      $kind: "ConsensusCommitPrologueV3";
    }
  | {
      ConsensusCommitPrologueV4: ConsensusCommitPrologueV4;
      $kind: "ConsensusCommitPrologueV4";
    };
export type TypeArgumentError =
  | {
      TypeNotFound: boolean;
      $kind: "TypeNotFound";
    }
  | {
      ConstraintNotSatisfied: boolean;
      $kind: "ConstraintNotSatisfied";
    };
export type TypeInput =
  | {
      bool: boolean;
      $kind: "bool";
    }
  | {
      U8: boolean;
      $kind: "U8";
    }
  | {
      U64: boolean;
      $kind: "U64";
    }
  | {
      U128: boolean;
      $kind: "U128";
    }
  | {
      Address: boolean;
      $kind: "Address";
    }
  | {
      Signer: boolean;
      $kind: "Signer";
    }
  | {
      Vector: TypeInput;
      $kind: "Vector";
    }
  | {
      Struct: StructInput;
      $kind: "Struct";
    }
  | {
      U16: boolean;
      $kind: "U16";
    }
  | {
      U32: boolean;
      $kind: "U32";
    }
  | {
      U256: boolean;
      $kind: "U256";
    };
export type TypeOrigin = {
  module_name: string;
  datatype_name: string;
  package: ObjectID;
};
export type TypeTag =
  | {
      Bool: boolean;
      $kind: "Bool";
    }
  | {
      U8: boolean;
      $kind: "U8";
    }
  | {
      U64: boolean;
      $kind: "U64";
    }
  | {
      U128: boolean;
      $kind: "U128";
    }
  | {
      Address: boolean;
      $kind: "Address";
    }
  | {
      Signer: boolean;
      $kind: "Signer";
    }
  | {
      Vector: TypeTag;
      $kind: "Vector";
    }
  | {
      struct: StructTag;
      $kind: "struct";
    }
  | {
      U16: boolean;
      $kind: "U16";
    }
  | {
      U32: boolean;
      $kind: "U32";
    }
  | {
      U256: boolean;
      $kind: "U256";
    };
export type TypedStoreError =
  | {
      RocksDBError: string;
      $kind: "RocksDBError";
    }
  | {
      SerializationError: string;
      $kind: "SerializationError";
    }
  | {
      UnregisteredColumn: string;
      $kind: "UnregisteredColumn";
    }
  | {
      CrossDBBatch: boolean;
      $kind: "CrossDBBatch";
    }
  | {
      MetricsReporting: boolean;
      $kind: "MetricsReporting";
    }
  | {
      RetryableTransactionError: boolean;
      $kind: "RetryableTransactionError";
    };
export type UnchangedSharedKind =
  | {
      ReadOnlyRoot: [SequenceNumber, ObjectDigest];
      $kind: "ReadOnlyRoot";
    }
  | {
      MutateConsensusStreamEnded: SequenceNumber;
      $kind: "MutateConsensusStreamEnded";
    }
  | {
      ReadConsensusStreamEnded: SequenceNumber;
      $kind: "ReadConsensusStreamEnded";
    }
  | {
      Cancelled: SequenceNumber;
      $kind: "Cancelled";
    }
  | {
      PerEpochConfig: boolean;
      $kind: "PerEpochConfig";
    };
export type UpgradeInfo = {
  upgraded_id: ObjectID;
  upgraded_version: SequenceNumber;
};
export type ZkLoginAuthenticatorAsBytes = number[];
export type ZkLoginPublicIdentifier = number[];
export type sui_types__message_envelope__Envelope$_sui_types__messages_checkpoint__CheckpointSummary_$_sui_types__crypto__AuthorityQuorumSignInfo$_true_$_$ =
  { data: CheckpointSummary; auth_signature: AuthorityQuorumSignInfo };
export type sui_types__message_envelope__Envelope$_sui_types__transaction__SenderSignedData_$_sui_types__crypto__EmptySignInfo_$ =
  { data: SenderSignedData; auth_signature: EmptySignInfo };
