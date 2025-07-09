import type { StructTag as OriginalStructTag, TypeTag } from '../types'

// Target type
export type StructTag = {
  address: string;
  module: string;
  name: string;
  typeParams: (string | StructTag)[];
};

function convertTypeTag(typeTag: TypeTag): string | StructTag {
  // Use $kind to determine type
  switch (typeTag.$kind) {
      case 'Bool':
          return 'bool';
      case 'U8':
          return 'u8';
      case 'U16':
          return 'u16';
      case 'U32':
          return 'u32';
      case 'U64':
          return 'u64';
      case 'U128':
          return 'u128';
      case 'U256':
          return 'u256';
      case 'Address':
          return 'address';
      case 'Signer':
          return 'signer';
      case 'Vector':
          const innerType = convertTypeTag(typeTag.Vector);
          if (typeof innerType === 'string') {
              return `vector<${innerType}>`;
          } else {
              // For nested struct in vector, we need to format it properly
              return `vector<${formatStructTag(innerType)}>`;
          }
      case 'struct':
          return convertStructTag(typeTag.struct);
      default:
          throw new Error('Unknown TypeTag type');
  }
}

// Helper function to format a StructTag as a string
export function formatStructTag(struct: StructTag): string {
  let result = `${struct.address}::${struct.module}::${struct.name}`;
  
  if (struct.typeParams.length > 0) {
      const params = struct.typeParams.map(param => 
          typeof param === 'string' ? param : formatStructTag(param)
      ).join(', ');
      result += `<${params}>`;
  }
  
  return result;
}

// Main conversion function
export function convertStructTag(original: OriginalStructTag): StructTag {
  return {
      address: original.address,
      module: original.module,
      name: original.name,
      typeParams: original.type_args.map(typeTag => convertTypeTag(typeTag))
  };
}
