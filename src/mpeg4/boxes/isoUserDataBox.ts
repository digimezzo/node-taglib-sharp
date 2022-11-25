import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import Mpeg4Box from "../mpeg4Box";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import IsoHandlerBox from "./isoHandlerBox";

/**
 * This class extends @see Mpeg4Box to provide an implementation of a ISO/IEC 14496-12 UserDataBox.
 */
export default class IsoUserDataBox extends Mpeg4Box {
    /**
     * The children of the current instance.
     */
    private _internalChildren: Mpeg4Box[];

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoUserDataBox with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @seeIsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoUserDataBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoUserDataBox {
        Guards.notNullOrUndefined(file, "file");

        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        const isoUserDataBox: IsoUserDataBox = base as IsoUserDataBox;

        isoUserDataBox._internalChildren = isoUserDataBox.loadChildren(file);

        return isoUserDataBox;
    }

    /**
     * Constructs and initializes a new instance of @see IsoUserDataBox with no children.
     * @returns A new instance of @see IsoUserDataBox
     */
    public static fromEmpty(): IsoUserDataBox {
        const base: Mpeg4Box = Mpeg4Box.fromType(ByteVector.fromString("udta", StringType.UTF8));
        const isoUserDataBox: IsoUserDataBox = base as IsoUserDataBox;

        isoUserDataBox._internalChildren = [];

        return isoUserDataBox;
    }

    /**
     * Gets the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._internalChildren;
    }

    /**
     *  Gets the box headers for the current "udta" box and all parent boxes up to the top of the file.
     */
    public parentTree: Mpeg4BoxHeader[];
}
