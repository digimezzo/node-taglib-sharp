import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4Box } from "../mpeg4Box";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { FullBox } from "./fullBox";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 * Constructs and initializes a new instance of @see IsoMetaBox with a provided header and
 * handler by reading the contents from a specified file.
 */
export class IsoMetaBox extends FullBox {
    /**
     * The children of the current instance.
     */
    private _internalChildren: Mpeg4Box[];

    /**
     * Constructs and initializes a new instance of @see IsoMetaBox with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoMetaBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoMetaBox {
        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const isoMetaBox: IsoMetaBox = base as IsoMetaBox;
        isoMetaBox._internalChildren = isoMetaBox.loadChildren(file);

        return isoMetaBox;
    }

    /**
     * Constructs and initializes a new instance of @see IsoMetaBox with a specified handler.
     * @param handlerType A @see ByteVector object specifying a 4 byte handler type.
     * @param handlerName A @see string object specifying the handler name.
     * @returns A new instance of @see IsoMetaBox
     */
    public static fromHandlerTypeAndHandlerName(handlerType: ByteVector, handlerName: string): IsoMetaBox {
        Guards.notNullOrUndefined(handlerType, "handlerType");

        if (handlerType.length < 4) {
            throw new Error("The handler type must be four bytes long.");
        }

        const base: FullBox = FullBox.fromTypeVersionAndFlags(ByteVector.fromString("meta", StringType.UTF8), 0, 0);
        const isoMetaBox: IsoMetaBox = base as IsoMetaBox;

        isoMetaBox._internalChildren = [];
        isoMetaBox.addChild(IsoHandlerBox.fromHandlerTypeAndHandlerName(handlerType, handlerName));

        return isoMetaBox;
    }

    /**
     * Gets the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._internalChildren;
    }
}
