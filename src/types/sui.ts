// Base types
export type GasCostSummary = {
  computationCost: string;
  storageCost: string;
  storageRebate: string;
  nonRefundableStorageFee: string;
};

export type AuthSignature = {
  epoch: string;
  signature: Array<number>;
  signers_map: Array<number>;
};

export type CheckpointSummaryData = {
  epoch: string;
  sequence_number: string;
  network_total_transactions: string;
  content_digest: string;
  previous_digest: string;
  epoch_rolling_gas_cost_summary: GasCostSummary;
  timestamp_ms: string;
  checkpoint_commitments: Array<any>;
  end_of_epoch_data: any;
  version_specific_data: Array<number>;
};

export type CheckpointSummary = {
  data: CheckpointSummaryData;
  auth_signature: AuthSignature;
};

// Transaction types
export type TransactionContent = {
  transaction: string;
  effects: string;
};

export type CheckpointContentsV1 = {
  transactions: Array<TransactionContent>;
  user_signatures: Array<Array<Array<number>>>;
};

export type CheckpointContents = {
  V1: CheckpointContentsV1;
  $kind: string;
};

// Intent and command types
export type Intent = {
  scope: number;
  version: number;
  app_id: number;
};

export type ConsensusCommitPrologueV4 = {
  epoch: string;
  round: string;
  sub_dag_index: any;
  commit_timestamp_ms: string;
  consensus_commit_digest: string;
  consensus_determined_version_assignments: {
    CancelledTransactionsV2: Array<any>;
    $kind: string;
  };
  additional_state_digest: string;
};

export type SharedObject = {
  id: string;
  initial_shared_version: string;
  mutable: boolean;
};

export type ObjectReference = {
  Object?: {
    SharedObject?: SharedObject;
    $kind: string;
    ImmOrOwnedObject?: Array<string>;
  };
  $kind: string;
  Pure?: Array<number>;
};

export type StructType = {
  address: string;
  module: string;
  name: string;
  type_args: Array<any>;
};

export type TypeArgument = {
  Struct: StructType;
  $kind: string;
};

export type Argument = {
  NestedResult?: Array<number>;
  $kind: string;
  Input?: number;
  GasCoin?: boolean;
  Result?: number;
};

export type MoveCallCommand = {
  package: string;
  module: string;
  function: string;
  type_arguments: Array<TypeArgument>;
  arguments: Array<Argument>;
};

export type MergeCoinsCommand = [
  {
    Input: number;
    $kind: string;
  },
  Array<{
    Input: number;
    $kind: string;
  }>
];

export type SplitCoinsCommand = [
  {
    Input: number;
    $kind: string;
  },
  Array<{
    Input: number;
    $kind: string;
  }>
];

export type TransferObjectsCommand = [
  Array<{
    NestedResult?: Array<number>;
    $kind: string;
    GasCoin?: boolean;
  }>,
  {
    Input: number;
    $kind: string;
  }
];

export type Command = {
  MoveCall?: MoveCallCommand;
  $kind: string;
  MergeCoins?: MergeCoinsCommand;
  SplitCoins?: SplitCoinsCommand;
  TransferObjects?: TransferObjectsCommand;
};

export type ProgrammableTransaction = {
  inputs: Array<ObjectReference>;
  commands: Array<Command>;
};

export type TransactionKind = {
  ConsensusCommitPrologueV4?: ConsensusCommitPrologueV4;
  $kind: string;
  ProgrammableTransaction?: ProgrammableTransaction;
};

export type GasData = {
  payment: Array<Array<string>>;
  owner: string;
  price: string;
  budget: string;
};

export type Expiration = {
  None?: boolean;
  $kind: string;
  Epoch?: string;
};

export type TransactionDataV1 = {
  kind: TransactionKind;
  sender: string;
  gas_data: GasData;
  expiration: Expiration;
};

export type IntentMessageValue = {
  V1: TransactionDataV1;
  $kind: string;
};

export type IntentMessage = {
  intent: Intent;
  value: IntentMessageValue;
};

export type TransactionDataItem = {
  intent_message: IntentMessage;
  tx_signatures: Array<Array<number>>;
};

// Effects types
export type TransactionStatus = {
  Success: boolean;
  $kind: string;
};

export type Owner = {
  Shared?: {
    initial_shared_version: string;
  };
  $kind: string;
  AddressOwner?: string;
  ObjectOwner?: string;
};

export type InputState = {
  Exist?: [Array<string>, Owner];
  $kind: string;
  NotExist?: boolean;
};

export type OutputState = {
  ObjectWrite?: [string, Owner];
  $kind: string;
  NotExist?: boolean;
};

export type IdOperation = {
  None?: boolean;
  $kind: string;
  Created?: boolean;
  Deleted?: boolean;
};

export type ChangedObject = [
  string,
  {
    input_state: InputState;
    output_state: OutputState;
    id_operation: IdOperation;
  }
];

export type UnchangedSharedObject = [
  string,
  {
    ReadOnlyRoot?: Array<string>;
    $kind: string;
    PerEpochConfig?: boolean;
  }
];

export type TransactionEffectsV2 = {
  status: TransactionStatus;
  executed_epoch: string;
  gas_used: GasCostSummary;
  transaction_digest: string;
  gas_object_index?: number;
  events_digest?: string;
  dependencies: Array<string>;
  lamport_version: string;
  changed_objects: Array<ChangedObject>;
  unchanged_shared_objects: Array<UnchangedSharedObject>;
  aux_data_digest: any;
};

export type TransactionEffects = {
  V2: TransactionEffectsV2;
  $kind: string;
};

// Event types
export type EventData = {
  package_id: string;
  transaction_module: string;
  sender: string;
  type_: StructType;
  contents: Array<number>;
};

export type Events = {
  data: Array<EventData>;
};

// Object types
export type TypeArg = {
  U64?: boolean;
  $kind: string;
  struct?: StructType;
};

export type MoveType = {
  Other?: {
    address: string;
    module: string;
    name: string;
    type_args: Array<TypeArg>;
  };
  $kind: string;
  GasCoin?: boolean;
  Coin?: {
    struct: StructType;
    $kind: string;
  };
};

export type MoveObjectData = {
  type_: MoveType;
  has_public_transfer: boolean;
  version: string;
  contents: Array<number>;
};

export type PackageObjectData = {
  id: string;
  version: string;
  module_map: Map<string, number[]>;
  type_origin_table: Array<{
    module_name: string;
    datatype_name: string;
    package: string;
  }>;
  linkage_table: Map<
    string,
    {
      upgraded_id: string;
      upgraded_version: string;
    }
  >;
};

export enum ObjectKind {
  Move = "Move",
  Package = "Package",
}

export type ObjectData =
  | {
      Move: MoveObjectData;
      $kind: ObjectKind.Move;
    }
  | {
      Package: PackageObjectData;
      $kind: ObjectKind.Package;
    };

export type Object = {
  data: ObjectData;
  owner: Owner;
  previous_transaction: string;
  storage_rebate: string;
};

// Transaction type
export type Transaction = {
  transaction: {
    data: Array<TransactionDataItem>;
    auth_signature: {};
  };
  effects: TransactionEffects;
  events?: Events;
  input_objects: Array<Object>;
  output_objects: Array<Object>;
};

// Main type
export type CheckpointData = {
  checkpoint_summary: CheckpointSummary;
  checkpoint_contents: CheckpointContents;
  transactions: Array<Transaction>;
};
