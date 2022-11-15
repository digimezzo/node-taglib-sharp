import { ByteVector } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4Box } from "../mpeg4Box";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 * This class extends @see Mpeg4Box to provide an implementation of an Apple AnnotationBox.
 */
export class AppleAnnotationBox extends Mpeg4Box {
    /**
     * The children of the current instance.
     */
    private _internalChildren: Mpeg4Box[];

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see AppleAnnotationBox with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see AppleAnnotationBox
     */
    public fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): AppleAnnotationBox {
        Guards.notNullOrUndefined(file, "file");

        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        const appleAnnotationBox: AppleAnnotationBox = base as AppleAnnotationBox;
        appleAnnotationBox._internalChildren = appleAnnotationBox.loadChildren(file);

        return appleAnnotationBox;
    }

    /**
     * Constructs and initializes a new instance of @see AppleAnnotationBox of specified type with no children.
     * @param type A @see ByteVector object containing a 4-byte box type.
     * @returns A new instance of @see AppleAnnotationBox
     */
    public fromType(type: ByteVector): AppleAnnotationBox {
        const base: Mpeg4Box = Mpeg4Box.fromType(type);
        const appleAnnotationBox: AppleAnnotationBox = base as AppleAnnotationBox;
        appleAnnotationBox._internalChildren = [];

        return appleAnnotationBox;
    }

    /**
     * Gets the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._internalChildren;
    }
}
