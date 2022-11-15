import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import { IAudioCodec, MediaTypes } from "../../properties";
import { Guards } from "../../utils";
import { Mpeg4Box } from "../mpeg4Box";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { AppleElementaryStreamDescriptor } from "./appleElementaryStreamDescriptor";
import { IsoHandlerBox } from "./isoHandlerBox";
import { IsoSampleEntry } from "./isoSampleEntry";

/**
 * Provides an implementation of a ISO/IEC 14496-12 AudioSampleEntry and support for reading MPEG-4 video properties.
 */
export class IsoAudioSampleEntry extends IsoSampleEntry implements IAudioCodec {
    /**
     * Contains the channel count.
     */
    private _channel_count: number;

    /**
     * Contains the sample size.
     */
    private _sample_size: number;

    /**
     * Contains the sample rate.
     */
    private _sample_rate: number;

    /**
     * Contains the children of the box.
     */
    private _internalChildren: Mpeg4Box[];

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoVisualSampleEntry with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoVisualSampleEntry
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoAudioSampleEntry {
        Guards.notNullOrUndefined(file, "file");

        const base: IsoSampleEntry = IsoSampleEntry.fromHeaderFileAndHandler(header, file, handler);
        const isoAudioSampleEntry: IsoAudioSampleEntry = base as IsoAudioSampleEntry;

        file.seek(base.dataPosition + 8);
        isoAudioSampleEntry._channel_count = file.readBlock(2).toUshort();
        isoAudioSampleEntry._sample_size = file.readBlock(2).toUshort();
        file.seek(base.dataPosition + 16);
        isoAudioSampleEntry._sample_rate = file.readBlock(4).toUint();
        isoAudioSampleEntry._internalChildren = isoAudioSampleEntry.loadChildren(file);

        return isoAudioSampleEntry;
    }

    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     */
    public get dataPosition(): number {
        return super.dataPosition + 20;
    }

    /**
     * Gets the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._internalChildren;
    }

    /**
     * Gets the duration of the media represented by the current instance.
     */
    public get durationMilliseconds(): number {
        return 0;
    }

    /**
     *  Gets the types of media represented by the current instance.
     */
    public get mediaTypes(): MediaTypes {
        return MediaTypes.Audio;
    }

    /**
     *  Gets a text description of the media represented by the current instance.
     */
    public get description(): string {
        return `MPEG-4 Audio (${this.boxType})`;
    }

    /**
     * Gets the bitrate of the audio represented by the current instance.
     */
    public get audioBitrate(): number {
        const esds: Mpeg4Box = this.getChildRecursively(ByteVector.fromString("esds", StringType.UTF8));

        // If we don't have an stream descriptor, we don't know what's what.
        if (!(esds instanceof AppleElementaryStreamDescriptor)) {
            return 0;
        }

        // Return from the elementary stream descriptor.
        return esds.averageBitrate;
    }

    /**
     * Gets the sample rate of the audio represented by the current instance.
     */
    public get audioSampleRate(): number {
        return <number>(this._sample_rate >> 16);
    }

    /**
     * Gets the number of channels in the audio represented by the current instance.
     */
    public get audioChannels(): number {
        return this._channel_count;
    }

    /**
     *  Gets the sample size of the audio represented by the current instance.
     */
    public get audioSampleSize(): number {
        return this._sample_size;
    }
}
