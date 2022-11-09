import { ByteVector } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4Box } from "../mpeg4Box";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 * Provides an implementation of a ISO/IEC 14496-12 FullBox.
 */
export class FullBox extends Mpeg4Box {
    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     */
    public get dataPosition(): number {
        return super.dataPosition + 4;
    }

    /**
     * Gets and sets the version number of the current instance.
     */
    public version: number;

    /**
     * Gets and sets the flags that apply to the current instance.
     */
    public flags: number;

    /**
     * Constructs and initializes a new instance of @see FullBox with a provided header and handler
     * by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see FullBox.
     */
    protected static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): FullBox {
        Guards.notNullOrUndefined(file, "file");

        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);

        file.seek(base.dataPosition);
        const headerData: ByteVector = file.readBlock(4);

        const fullBox: FullBox = base as FullBox;
        fullBox.version = headerData.get(0);
        fullBox.flags = headerData.subarray(1, 3).toUint();

        return fullBox;
    }

    /**
     * Constructs and initializes a new instance of @see FullBox with a provided header, version, and flags.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param version A value containing the version of the new instance.
     * @param flags A value containing the flags for the new instance.
     * @returns A new instance of @see FullBox.
     */
    protected static fromHeaderVersionAndFlags(header: Mpeg4BoxHeader, version: number, flags: number): FullBox {
        const base: Mpeg4Box = Mpeg4Box.fromHeader(header);

        const fullBox: FullBox = base as FullBox;
        fullBox.version = version;
        fullBox.flags = flags;

        return fullBox;
    }

    /**
     * Constructs and initializes a new instance of @see FullBox with a provided header, version, and flags.
     * @param type A @see ByteVector object containing the four byte box type.
     * @param version A value containing the version of the new instance.
     * @param flags A value containing the flags for the new instance.
     * @returns A new instance of @see FullBox.
     */
    protected static fromTypeVersionAndFlags(type: ByteVector, version: number, flags: number): FullBox {
        return this.fromHeaderVersionAndFlags(Mpeg4BoxHeader.fromType(type), version, flags);
    }

    /**
     * Renders the current instance, including its children, to a new @see ByteVector object, preceding the
     * contents with a specified block of data.
     * @param topData A @see ByteVector object containing box specific header data to precede the content.
     * @returns A @see ByteVector object containing the rendered version of the current instance.
     */
    protected renderUsingTopData(topData: ByteVector): ByteVector {
        // TODO: not sure if this is correct. I don't understand the syntax in the original code.
        const output: ByteVector = ByteVector.concatenate(
            ByteVector.fromInt(this.version),
            ByteVector.fromUint(this.flags).subarray(1, 3),
            topData
        );

        return super.renderUsingTopData(output);
    }
}
