import { ByteVector } from "../../byteVector";
import { File } from "../../file";
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
    protected get dataPosition(): number {
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
    protected fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): FullBox {
        // TODO
        return undefined;
    }

    /**
     * Constructs and initializes a new instance of @see FullBox with a provided header, version, and flags.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A value containing the version of the new instance.
     * @param handler A value containing the flags for the new instance.
     * @returns A new instance of @see FullBox.
     */
    protected fromHeaderVersionAndFlags(header: Mpeg4BoxHeader, version: number, flags: number): FullBox {
        // TODO
        return undefined;
    }

    /**
     * Constructs and initializes a new instance of @see FullBox with a provided header, version, and flags.
     * @param type A @see ByteVector object containing the four byte box type.
     * @param version A value containing the version of the new instance.
     * @param flags A value containing the flags for the new instance.
     * @returns A new instance of @see FullBox.
     */
    protected fromTypeVersionAndFlags(type: ByteVector, version: number, flags: number): FullBox {
        // TODO
        return undefined;
    }

    /**
     * Renders the current instance, including its children, to a new @see ByteVector object, preceding the
     * contents with a specified block of data.
     * @param topData A @see ByteVector object containing box specific header data to precede the content.
     * @returns A @see ByteVector object containing the rendered version of the current instance.
     */
    protected renderUsingTopData(topData: ByteVector): ByteVector {
        // TODO
        return undefined;
    }
}
