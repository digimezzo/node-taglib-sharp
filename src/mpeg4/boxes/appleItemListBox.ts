import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4Box } from "../mpeg4Box";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 * This class extends @see Mpeg4Box to provide an implementation of an Apple ItemListBox.
 */
export class AppleItemListBox extends Mpeg4Box {
    /**
     * The children of the current instance.
     */
    private _internalChildren: Mpeg4Box[] = undefined;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see AppleItemListBox with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see AppleItemListBox
     */
    public fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): AppleItemListBox {
        Guards.notNullOrUndefined(file, "file");

        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        const appleItemListBox: AppleItemListBox = base as AppleItemListBox;

        appleItemListBox._internalChildren = appleItemListBox.loadChildren(file);

        return appleItemListBox;
    }

    /**
     * Constructs and initializes a new instance of @see AppleItemListBox with no children.
     * @returns A new instance of @see AppleItemListBox
     */
    public fromEmpty(): AppleItemListBox {
        const base: Mpeg4Box = Mpeg4Box.fromType(ByteVector.fromString("ilst", StringType.UTF8));
        const appleItemListBox: AppleItemListBox = base as AppleItemListBox;

        appleItemListBox._internalChildren = [];

        return appleItemListBox;
    }

    /**
     * Gets the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._internalChildren;
    }
}
