import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { FullBox } from "./fullBox";

/**
 * This class extends @see FullBox to provide an implementation of a ISO/IEC 14496-12 FullBox.
 */
export class IsoHandlerBox extends FullBox {
    /**
     * The handler type of the current instance.
     */
    private _handlerType: ByteVector;

    /**
     * The name of the current instance.
     */
    private _name: string;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoHandlerBox with a provided header and h
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoHandlerBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoHandlerBox {
        Guards.notNullOrUndefined(file, "file");

        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const isoHandlerBox: IsoHandlerBox = base as IsoHandlerBox;

        file.seek(isoHandlerBox.dataPosition + 4);
        const box_data: ByteVector = file.readBlock(isoHandlerBox.dataSize - 4);
        isoHandlerBox._handlerType = box_data.subarray(0, 4);

        let end: number = box_data.find(ByteVector.fromInt(0), 16);

        if (end < 16) {
            end = box_data.length;
        }

        isoHandlerBox._name = end > 16 ? box_data.subarray(16, end - 16).toString(StringType.UTF8) : "";

        return isoHandlerBox;
    }

    /**
     * Constructs and initializes a new instance of @see IsoHandlerBox with a specified type and name.
     * @param handlerType A @see ByteVector object specifying a 4 byte handler type.
     * @param name An object specifying the handler name.
     * @returns A new instance of @see IsoHandlerBox
     */
    public static fromHandlerTypeAndHandlerName(handlerType: ByteVector, name: string): IsoHandlerBox {
        Guards.notNullOrUndefined(handlerType, "handlerType");

        if (handlerType.length < 4) {
            throw new Error("The handler type must be four bytes long.");
        }

        const base: FullBox = FullBox.fromTypeVersionAndFlags(ByteVector.fromString("hdlr", StringType.UTF8), 0, 0);
        const isoHandlerBox: IsoHandlerBox = base as IsoHandlerBox;

        isoHandlerBox._handlerType = handlerType.subarray(0, 4);
        isoHandlerBox._name = name;

        return isoHandlerBox;
    }

    /**
     * Gets the data contained in the current instance.
     */
    public get data(): ByteVector {
        // TODO: not sure if this is correct. I don't understand the syntax in the original code.
        const output: ByteVector = ByteVector.concatenate(
            this.handlerType,
            ByteVector.fromInt(12),
            ByteVector.fromString(this.name, StringType.UTF8),
            ByteVector.fromInt(2)
        );

        return output;
    }

    /**
     * Gets the handler type of the current instance.
     * @returns A @see ByteVector object containing the handler type of the current instance.
     */
    public get handlerType(): ByteVector {
        return this._handlerType;
    }

    /**
     * Gets the name of the current instance.
     */
    public get name(): string {
        return this._name;
    }
}
