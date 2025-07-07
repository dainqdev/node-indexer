// Constants
const VERSION_1 = 1;
const VERSION_MAX = 7;
const U16_MAX = 0xFFFF; // 65535

/**
 * Configuration for the binary format related to table size.
 * Maps to all tables in the binary format.
 */
class TableConfig {
  moduleHandles: number;
  datatypeHandles: number;
  functionHandles: number;
  functionInstantiations: number;
  signatures: number;
  constantPool: number;
  identifiers: number;
  addressIdentifiers: number;
  structDefs: number;
  structDefInstantiations: number;
  functionDefs: number;
  fieldHandles: number;
  fieldInstantiations: number;
  friendDecls: number;
  enumDefs: number;
  enumDefInstantiations: number;
  variantHandles: number;
  variantInstantiationHandles: number;

  constructor(config?: Partial<TableConfig>) {
    this.moduleHandles = config?.moduleHandles ?? U16_MAX;
    this.datatypeHandles = config?.datatypeHandles ?? U16_MAX;
    this.functionHandles = config?.functionHandles ?? U16_MAX;
    this.functionInstantiations = config?.functionInstantiations ?? U16_MAX;
    this.signatures = config?.signatures ?? U16_MAX;
    this.constantPool = config?.constantPool ?? U16_MAX;
    this.identifiers = config?.identifiers ?? U16_MAX;
    this.addressIdentifiers = config?.addressIdentifiers ?? U16_MAX;
    this.structDefs = config?.structDefs ?? U16_MAX;
    this.structDefInstantiations = config?.structDefInstantiations ?? U16_MAX;
    this.functionDefs = config?.functionDefs ?? U16_MAX;
    this.fieldHandles = config?.fieldHandles ?? U16_MAX;
    this.fieldInstantiations = config?.fieldInstantiations ?? U16_MAX;
    this.friendDecls = config?.friendDecls ?? U16_MAX;
    this.enumDefs = config?.enumDefs ?? U16_MAX;
    this.enumDefInstantiations = config?.enumDefInstantiations ?? U16_MAX;
    this.variantHandles = config?.variantHandles ?? U16_MAX;
    this.variantInstantiationHandles = config?.variantInstantiationHandles ?? U16_MAX;
  }

  /**
   * The deserializer and other parts of the system already have limits in place,
   * this is the "legacy" configuration that is effectively the "no limits" setup.
   * This table is a noop with `u16::MAX`.
   */
  static legacy(): TableConfig {
    return new TableConfig({
      moduleHandles: U16_MAX,
      datatypeHandles: U16_MAX,
      functionHandles: U16_MAX,
      functionInstantiations: U16_MAX,
      signatures: U16_MAX,
      constantPool: U16_MAX,
      identifiers: U16_MAX,
      addressIdentifiers: U16_MAX,
      structDefs: U16_MAX,
      structDefInstantiations: U16_MAX,
      functionDefs: U16_MAX,
      fieldHandles: U16_MAX,
      fieldInstantiations: U16_MAX,
      friendDecls: U16_MAX,
      // These can be any number
      enumDefs: U16_MAX,
      enumDefInstantiations: U16_MAX,
      variantHandles: 1024,
      variantInstantiationHandles: 1024,
    });
  }

  // Clone method for TypeScript
  clone(): TableConfig {
    return new TableConfig({
      moduleHandles: this.moduleHandles,
      datatypeHandles: this.datatypeHandles,
      functionHandles: this.functionHandles,
      functionInstantiations: this.functionInstantiations,
      signatures: this.signatures,
      constantPool: this.constantPool,
      identifiers: this.identifiers,
      addressIdentifiers: this.addressIdentifiers,
      structDefs: this.structDefs,
      structDefInstantiations: this.structDefInstantiations,
      functionDefs: this.functionDefs,
      fieldHandles: this.fieldHandles,
      fieldInstantiations: this.fieldInstantiations,
      friendDecls: this.friendDecls,
      enumDefs: this.enumDefs,
      enumDefInstantiations: this.enumDefInstantiations,
      variantHandles: this.variantHandles,
      variantInstantiationHandles: this.variantInstantiationHandles,
    });
  }
}

/**
 * Configuration information for deserializing a binary.
 * Controls multiple aspects of the deserialization process.
 */
class BinaryConfig {
  maxBinaryFormatVersion: number;
  minBinaryFormatVersion: number;
  checkNoExtraneousBytes: boolean;
  tableConfig: TableConfig;

  constructor(
    maxBinaryFormatVersion: number,
    minBinaryFormatVersion: number,
    checkNoExtraneousBytes: boolean,
    tableConfig: TableConfig
  ) {
    this.maxBinaryFormatVersion = maxBinaryFormatVersion;
    this.minBinaryFormatVersion = minBinaryFormatVersion;
    this.checkNoExtraneousBytes = checkNoExtraneousBytes;
    this.tableConfig = tableConfig;
  }

  static new(
    maxBinaryFormatVersion: number,
    minBinaryFormatVersion: number,
    checkNoExtraneousBytes: boolean,
    tableConfig: TableConfig
  ): BinaryConfig {
    return new BinaryConfig(
      maxBinaryFormatVersion,
      minBinaryFormatVersion,
      checkNoExtraneousBytes,
      tableConfig
    );
  }

  /**
   * We want to make this disappear from the public API in favor of a "true" config
   */
  static legacy(
    maxBinaryFormatVersion: number,
    minBinaryFormatVersion: number,
    checkNoExtraneousBytes: boolean
  ): BinaryConfig {
    return new BinaryConfig(
      maxBinaryFormatVersion,
      minBinaryFormatVersion,
      checkNoExtraneousBytes,
      TableConfig.legacy()
    );
  }

  /**
   * Run always with the max version but with controllable "extraneous bytes check"
   */
  static withExtraneousBytesCheck(checkNoExtraneousBytes: boolean): BinaryConfig {
    return new BinaryConfig(
      VERSION_MAX,
      VERSION_1,
      checkNoExtraneousBytes,
      TableConfig.legacy()
    );
  }

  /**
   * VERSION_MAX and check_no_extraneous_bytes = true
   * common "standard/default" in code base now
   */
  static standard(): BinaryConfig {
    return new BinaryConfig(
      VERSION_MAX,
      VERSION_1,
      true,
      TableConfig.legacy()
    );
  }

  // Clone method for TypeScript
  clone(): BinaryConfig {
    return new BinaryConfig(
      this.maxBinaryFormatVersion,
      this.minBinaryFormatVersion,
      this.checkNoExtraneousBytes,
      this.tableConfig.clone()
    );
  }
}

// Export classes and constants
export { TableConfig, BinaryConfig };