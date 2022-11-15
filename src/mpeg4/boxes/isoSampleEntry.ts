import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4Box } from "../mpeg4Box";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { IsoHandlerBox } from "./isoHandlerBox";

export class IsoSampleEntry extends Mpeg4Box {
    /**
     * The data reference index of the current instance.
     */
    private _dataReferenceIndex: number;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoSampleEntry with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoSampleEntry
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoSampleEntry {
        Guards.notNullOrUndefined(file, "file");

        const box: Mpeg4Box = Mpeg4Box.fromHeaderAndHandler(header, handler);
        file.seek(box.dataPosition + 6);

        const isoSampleEntry: IsoSampleEntry = box as IsoSampleEntry;
        isoSampleEntry._dataReferenceIndex = file.readBlock(2).toUshort();

        return isoSampleEntry;
    }

    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     * @return A value containing the position of the data contained in the current instance.
     */
    public get dataPosition(): number {
        return super.dataPosition + 8;
    }

    /**
     * Gets the data reference index of the current instance.
     * @return A value containing the data reference index of the current instance.
     */
    public get dataReferenceIndex(): number {
        return this._dataReferenceIndex;
    }

    private set dataReferenceIndex(v: number) {
        this._dataReferenceIndex = v;
    }
}
