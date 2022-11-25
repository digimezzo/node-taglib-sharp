import { ByteVector } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import Mpeg4Box from "../mpeg4Box";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import IsoHandlerBox from "./isoHandlerBox";

export default class UnknownBox extends Mpeg4Box {
    /**
     * Contains the box's data.
     */
    private _data: ByteVector;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see UnknownBox with a provided header and handler
     * by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see UnknownBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): UnknownBox {
        Guards.notNullOrUndefined(file, "file");

        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        const unknownBox: UnknownBox = base as UnknownBox;

        unknownBox._data = file.readBlock(unknownBox.dataSize > 0 ? unknownBox.dataSize : 0);

        return unknownBox;
    }

    /**
     * Gets and sets the box data contained in the current instance.
     */
    public get data(): ByteVector {
        return this._data;
    }

    public set data(v: ByteVector) {
        this._data = v;
    }
}
