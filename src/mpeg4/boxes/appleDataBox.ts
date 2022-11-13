import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { FullBox } from "./fullBox";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 * Specifies the type of data contained in a box.
 */
export enum FlagType {
    /**
     * The box contains UTF-8 text.
     */
    ContainsText = 0x01,

    /**
     * The box contains binary data.
     */
    ContainsData = 0x00,

    /**
     * The box contains data for a tempo box.
     */
    ForTempo = 0x15,

    /**
     * The box contains a raw JPEG image.
     */
    ContainsJpegData = 0x0d,

    /**
     * The box contains a raw PNG image.
     */
    ContainsPngData = 0x0e,

    /**
     * The box contains a raw BMP image.
     */
    ContainsBmpData = 0x1b,
}

export class AppleDataBox extends FullBox {
    /**
     * Contains the box data.
     */
    private _data: ByteVector;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see AppleDataBox with a provided header and handler
     * by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader  object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see AppleDataBox
     */
    public fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): AppleDataBox {
        Guards.notNullOrUndefined(file, "file");

        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const appleDataBox: AppleDataBox = base as AppleDataBox;
        appleDataBox.data = appleDataBox.loadData(file);

        return appleDataBox;
    }

    /**
     * Constructs and initializes a new instance of @see AppleDataBox with specified data and flags.
     * @param data A @see ByteVector object containing the data to store in the new instance.
     * @param flags A value containing flags to use for the new instance.
     * @returns
     */
    public static fromDataAndFlags(data: ByteVector, flags: number): AppleDataBox {
        const base: FullBox = FullBox.fromTypeVersionAndFlags(ByteVector.fromString("data", StringType.UTF8), 0, flags);
        const appleDataBox: AppleDataBox = base as AppleDataBox;

        return appleDataBox;
    }

    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     */
    public get dataPosition(): number {
        return super.dataPosition + 4;
    }

    /**
     * Gets and sets the data contained in the current instance.
     */
    public get data(): ByteVector {
        return this._data;
    }
    public set data(v: ByteVector) {
        this._data = v ?? ByteVector.empty();
    }

    /**
     * Gets and sets the text contained in the current instance.
     */
    public get text(): string {
        return (this.flags & (<number>FlagType.ContainsText)) !== 0 ? this.data.toString(StringType.UTF8) : undefined;
    }
    public set text(v: string) {
        this.flags = <number>FlagType.ContainsText;
        this.data = ByteVector.fromString(v, StringType.UTF8);
    }

    /**
     * Renders the current instance, including its children, to a new @see ByteVector object, preceding the
     * contents with a specified block of data.
     * @param topData A @see ByteVector object containing box specific header data to precede the content.
     * @returns
     */
    protected renderUsingTopData(topData: ByteVector): ByteVector {
        // TODO: not sure if this is correct. I don't understand the syntax in the original code.
        const output: ByteVector = ByteVector.concatenate(ByteVector.fromInt(4), topData);

        return super.renderUsingTopData(output);
    }
}
