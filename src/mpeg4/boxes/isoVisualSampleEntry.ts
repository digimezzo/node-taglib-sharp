import { File } from "../../file";
import { IVideoCodec, MediaTypes } from "../../properties";
import { Guards } from "../../utils";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import IsoHandlerBox from "./isoHandlerBox";
import IsoSampleEntry from "./isoSampleEntry";

/**
 * This class extends @see IsoSampleEntry and implements @see IVideoCodec to provide an implementation of a
 * ISO/IEC 14496-12 VisualSampleEntry and support for reading MPEG-4 video properties.
 */
export default class IsoVisualSampleEntry extends IsoSampleEntry implements IVideoCodec {
    /**
     * Contains the width of the visual.
     */
    private _width: number;

    /**
     * Contains the height of the visual.
     */
    private _height: number;

    public constructor() {
        super();
    }

    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoVisualSampleEntry {
        Guards.notNullOrUndefined(file, "file");

        const base: IsoSampleEntry = IsoSampleEntry.fromHeaderFileAndHandler(header, file, handler);
        const isoVisualSampleEntry: IsoVisualSampleEntry = base as IsoVisualSampleEntry;

        file.seek(base.dataPosition + 16);
        isoVisualSampleEntry._width = file.readBlock(2).toUshort();
        isoVisualSampleEntry._height = file.readBlock(2).toUshort();

        /*
		TODO: What are the children anyway?
		children = LoadChildren (file);
		*/

        return isoVisualSampleEntry;
    }

    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     */
    public get dataPosition(): number {
        return super.dataPosition + 62;
    }

    /**
     * Gets the duration of the media represented by the current instance.
     */
    public get durationMilliseconds(): number {
        return 0;
    }

    /**
     * Gets the types of media represented by the current instance.
     */
    public get mediaTypes(): MediaTypes {
        return MediaTypes.Video;
    }

    /**
     * Gets a text description of the media represented by the current instance.
     */
    public get description(): string {
        return `MPEG-4 Video (${this.boxType})`;
    }

    /**
     * Gets the width of the video represented by the current instance.
     */
    public get videoWidth(): number {
        return this._width;
    }

    /**
     * Gets the height of the video represented by the current instance.
     */
    public get videoHeight(): number {
        return this._height;
    }
}
