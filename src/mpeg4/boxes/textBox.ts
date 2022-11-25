import { ByteVector } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import Mpeg4Box from "../mpeg4Box";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import IsoHandlerBox from "./isoHandlerBox";

/**
 * Represents an MP4 text box
 */
export default class TextBox extends Mpeg4Box {
    /**
     * Contains the box's data.
     */
    private _data: ByteVector;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see TextBox with a provided header and handler
     * by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see TextBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): TextBox {
        Guards.notNullOrUndefined(file, "file");

        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        const textBox: TextBox = base as TextBox;

        textBox._data = textBox.loadData(file);

        return textBox;
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
