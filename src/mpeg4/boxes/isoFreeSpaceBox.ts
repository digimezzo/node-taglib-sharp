import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { Mpeg4Box } from "../mpeg4Box";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 *  This class extends @see Mpeg4Box to provide an implementation of a ISO/IEC 14496-12 FreeSpaceBox.
 */
export class IsoFreeSpaceBox extends Mpeg4Box {
    /**
     * Contains the size of the padding.
     */
    private _padding: number;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoFreeSpaceBox with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file  A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoFreeSpaceBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoFreeSpaceBox {
        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        const isoFreeSpaceBox: IsoFreeSpaceBox = base as IsoFreeSpaceBox;
        isoFreeSpaceBox._padding = isoFreeSpaceBox.dataSize;

        return isoFreeSpaceBox;
    }

    /**
     * Constructs and initializes a new instance of @see IsoFreeSpaceBox to occupy a specified number of bytes.
     * @param padding  A value specifying the number of bytes the new instance should occupy when rendered.
     * @returns A new instance of @see IsoFreeSpaceBox
     */
    public static fromPadding(padding: number): IsoFreeSpaceBox {
        const base: Mpeg4Box = Mpeg4Box.fromType(ByteVector.fromString("free", StringType.UTF8));
        const isoFreeSpaceBox: IsoFreeSpaceBox = base as IsoFreeSpaceBox;
        isoFreeSpaceBox.paddingSize = isoFreeSpaceBox._padding;

        return isoFreeSpaceBox;
    }

    /**
     * Gets and sets the data contained in the current instance.
     * @returns A @see ByteVector object containing the data contained in the current instance.
     */
    public get data(): ByteVector {
        return ByteVector.fromInt(this._padding);
    }
    public set data(v: ByteVector) {
        this._padding = v !== null && v !== undefined ? v.length : 0;
    }

    /**
     * Gets and sets the size the current instance will occupy when rendered.
     * @returns A value containing the size the current instance will occupy when rendered.
     */
    public get paddingSize(): number {
        return this._padding + 8;
    }
    public set paddingSize(v: number) {
        this._padding = v - 8;
    }
}
