import { File } from "../../file";
import { Guards } from "../../utils";
import Mpeg4Box from "../mpeg4Box";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import FullBox from "./fullBox";
import IsoHandlerBox from "./isoHandlerBox";

/**
 * This class extends @see FullBox to provide an implementation of a ISO/IEC 14496-12 SampleDescriptionBox.
 */
export default class IsoSampleDescriptionBox extends FullBox {
    /**
     * The number of boxes at the beginning of the children that will be stored as @see IsoAudioSampleEntry
     * of @see IsoVisualSampleEntry" objects, depending on the handler.
     */
    private _entryCount: number;

    /**
     * The children of the current instance.
     */
    private _internalChildren: Mpeg4Box[];

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoSampleDescriptionBox with a provided header
     * and handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoSampleDescriptionBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoSampleDescriptionBox {
        Guards.notNullOrUndefined(file, "file");

        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const isoSampleDescriptionBox: IsoSampleDescriptionBox = base as IsoSampleDescriptionBox;

        isoSampleDescriptionBox._entryCount = file.readBlock(4).toUint();
        isoSampleDescriptionBox._internalChildren = isoSampleDescriptionBox.loadChildren(file);

        return isoSampleDescriptionBox;
    }

    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     */
    public get dataPosition(): number {
        return super.dataPosition + 4;
    }

    /**
     * Gets the number of boxes at the beginning of the children that will be stored as @see IsoAudioSampleEntry
     * of @see IsoVisualSampleEntry" objects, depending on the handler.
     */
    public get entryCount(): number {
        return this._entryCount;
    }

    /**
     * Gets the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._internalChildren;
    }
}
