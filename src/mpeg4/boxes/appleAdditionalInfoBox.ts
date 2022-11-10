import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { StringUtils } from "../../utils";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { FullBox } from "./fullBox";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 *  This class extends @see FullBox to provide an implementation of an Apple AdditionalInfoBox.
 */
export class AppleAdditionalInfoBox extends FullBox {
    /**
     * Contains the box data.
     */
    private _data: ByteVector;

    /**
     * Constructs and initializes a new instance of @see AppleAdditionalInfoBox with a provided header
     * and handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see AppleAdditionalInfoBox.
     */
    protected static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): AppleAdditionalInfoBox {
        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const appleAdditionalInfoBox: AppleAdditionalInfoBox = base as AppleAdditionalInfoBox;
        appleAdditionalInfoBox.data = file.readBlock(appleAdditionalInfoBox.dataSize > 0 ? appleAdditionalInfoBox.dataSize : 0);

        return appleAdditionalInfoBox;
    }

    /**
     * Constructs and initializes a new instance of @see FullBox with a provided header, version, and flags.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param version A value containing the version of the new instance.
     * @param flags A value containing the flags for the new instance.
     * @returns A new instance of @see FullBox.
     */
    protected static fromHeaderVersionAndFlags(header: Mpeg4BoxHeader, version: number, flags: number): AppleAdditionalInfoBox {
        const base: FullBox = FullBox.fromHeaderVersionAndFlags(header, version, flags);
        const appleAdditionalInfoBox: AppleAdditionalInfoBox = base as AppleAdditionalInfoBox;

        return appleAdditionalInfoBox;
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
        return StringUtils.trimStart(this._data.toString(StringType.Latin1), "\0");
    }
    public set text(v: string) {
        this._data = ByteVector.fromString(v, StringType.Latin1);
    }
}
