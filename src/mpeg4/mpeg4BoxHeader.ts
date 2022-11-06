import { ByteVector, StringType } from "../byteVector";
import { File } from "../file";
import { Guards } from "../utils";
import Mpeg4Box from "./mpeg4Box";
import Mpeg4BoxType from "./mpeg4BoxTypes";

/**
 *  Provides support for reading and writing headers for ISO/IEC 14496-12 boxes.
 */
export default class Mpeg4BoxHeader {
  /**
   *  Contains the box size.
   */
  private _boxSize: number;

  /**
   *  Contains the header size.
   */
  private _headerSize: number;

  /**
   *  Contains the position of the header.
   */
  private _position: number;

  /**
   * Indicates that the header was read from a file.
   */
  private _fromDisk: boolean;

  /**
   * An empty box header.
   */
  public static readonly empty: Mpeg4BoxHeader = Mpeg4BoxHeader.fromByteVector(
    ByteVector.fromString("xxxx", StringType.UTF8)
  );

  public constructor() { }

  public box: Mpeg4Box;
  public boxType: ByteVector;
  public extendedType: ByteVector;

  public static fromFile(file: File, position: number): Mpeg4BoxHeader {
    Guards.notNullOrUndefined(file, "file");

    const header = new Mpeg4BoxHeader();
    header.box = undefined;
    header._fromDisk = true;
    header._position = position;

    file.seek(position);

    const data: ByteVector = file.readBlock(32);
    let offset: number = 0;

    if (data.length < 8 + offset) {
      throw new Error("Not enough data in box header.");
    }

    header._headerSize = 8;
    header._boxSize = data.subarray(offset, 4).toUint();
    header.boxType = data.subarray(offset + 4, 4);

    // If the size is 1, that just tells us we have a
    // massive ULONG size waiting for us in the next 8
    // bytes.
    if (header._boxSize === 1) {
      if (data.length < 8 + offset) {
        throw new Error("Not enough data in box header.");
      }

      header._headerSize += 8;
      offset + 8;
      header._boxSize = data.subarray(offset, 8).toUint();

      // UUID has a special header with 16 extra bytes.
      if (header.boxType === Mpeg4BoxType.uuid) {
        if (data.length < 16 + offset) {
          throw new Error("Not enough data in box header.");
        }

        header._headerSize += 16;
        header.extendedType = data.subarray(offset, 16);
      } else {
        header.extendedType = undefined;
      }

      if (header._boxSize > (file.length - position)) {
        throw new Error(`Box header specified a size of ${header._boxSize} bytes but only ${file.length - position} bytes left in the file`);
      }
    }

    return header;
  }

  public static fromByteVector(type: ByteVector): Mpeg4BoxHeader {
    return Mpeg4BoxHeader.fromByteVectors(type, undefined);
  }

  public static fromByteVectors(
    type: ByteVector,
    extendedType: ByteVector
  ): Mpeg4BoxHeader {
    const header = new Mpeg4BoxHeader();
    header._position = -1;
    header.box = undefined;
    header._fromDisk = false;
    header.boxType = type;

    Guards.notNullOrUndefined(type, "type");
    Guards.equals(type.length, 4, "type.length");

    header._boxSize = 8;
    header._headerSize = 8;

    if (type.toString(StringType.UTF8) !== "uuid") {
      if (extendedType !== null && extendedType !== undefined) {
        throw new Error("Extended type only permitted for 'uuid'.");
      }

      header.extendedType = extendedType;
      return;
    }

    Guards.notNullOrUndefined(extendedType, "extendedType");
    Guards.equals(extendedType.length, 16, "extendedType.length");

    header._boxSize = 16;
    header._headerSize = 16;

    header.extendedType = extendedType;

    return new Mpeg4BoxHeader();
  }
}
