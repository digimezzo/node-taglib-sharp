import { File } from "../../file";
import { Guards } from "../../utils";
import Mpeg4Box from "../mpeg4Box";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import IsoHandlerBox from "./isoHandlerBox";

/**
 * This class extends @see Mpeg4Box to provide an implementation of a ISO/IEC 14496-12 SampleTableBox.
 */
export default class IsoSampleTableBox extends Mpeg4Box {
    /**
     * The children of the current instance.
     */
    private _internalChildren: Mpeg4Box[];

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoSampleTableBox with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoSampleTableBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoSampleTableBox {
        Guards.notNullOrUndefined(file, "file");

        const base: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        const isoSampleTableBox: IsoSampleTableBox = base as IsoSampleTableBox;

        isoSampleTableBox._internalChildren = isoSampleTableBox.loadChildren(file);

        return isoSampleTableBox;
    }

    /**
     * Gets the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._internalChildren;
    }
}
