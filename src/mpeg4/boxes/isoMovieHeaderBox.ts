import { ByteVector } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import FullBox from "./fullBox";
import IsoHandlerBox from "./isoHandlerBox";

/**
 * This class extends @see FullBox to provide an implementation of a ISO/IEC 14496-12 MovieHeaderBox.
 */
export default class IsoMovieHeaderBox extends FullBox {
    /**
     * The ID of the next track in the movie represented by the current instance.
     */
    private _nextTrackId: number;

    /**
     * Contains the creation time of the movie.
     */
    private _creation_time: number;

    /**
     * Contains the modification time of the movie.
     */
    private _modification_time: number;

    /**
     * Contains the timescale.
     */
    private _timescale: number;

    /**
     * Contains the duration.
     */
    private _duration: number;

    /**
     * Contains the rate.
     */
    private _rate: number;

    /**
     * Contains the volume.
     */
    private _volume: number;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoMovieHeaderBox with a provided header and
     * handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see IsoMovieHeaderBox
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoMovieHeaderBox {
        Guards.notNullOrUndefined(file, "file");

        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const isoMovieHeaderBox: IsoMovieHeaderBox = base as IsoMovieHeaderBox;

        let bytes_remaining: number = isoMovieHeaderBox.dataSize;
        let data: ByteVector;

        if (isoMovieHeaderBox.version === 1) {
            // Read version one (large integers).
            data = file.readBlock(Math.min(28, bytes_remaining));

            if (data.length >= 8) {
                isoMovieHeaderBox._creation_time = Number(data.subarray(0, 8).toUlong());
            }

            if (data.length >= 16) {
                isoMovieHeaderBox._modification_time = Number(data.subarray(8, 8).toUlong());
            }

            if (data.length >= 20) {
                isoMovieHeaderBox._timescale = data.subarray(16, 4).toUint();
            }

            if (data.length >= 28) {
                isoMovieHeaderBox._duration = Number(data.subarray(20, 8).toUlong());
            }

            bytes_remaining -= 28;
        } else {
            // Read version zero (normal integers).
            data = file.readBlock(Math.min(16, bytes_remaining));

            if (data.length >= 4) {
                isoMovieHeaderBox._creation_time = data.subarray(0, 4).toUint();
            }

            if (data.length >= 8) {
                isoMovieHeaderBox._modification_time = data.subarray(4, 4).toUint();
            }

            if (data.length >= 12) {
                isoMovieHeaderBox._timescale = data.subarray(8, 4).toUint();
            }

            if (data.length >= 16) {
                isoMovieHeaderBox._duration = data.subarray(12, 4).toUint();
            }

            bytes_remaining -= 16;
        }

        data = file.readBlock(Math.min(6, bytes_remaining));

        if (data.length >= 4) {
            isoMovieHeaderBox._rate = data.subarray(0, 4).toUint();
        }

        if (data.length >= 6) {
            isoMovieHeaderBox._volume = data.subarray(4, 2).toUshort();
        }

        file.seek(file.tell + 70);
        bytes_remaining -= 76;

        data = file.readBlock(Math.min(4, bytes_remaining));

        if (data.length >= 4) {
            isoMovieHeaderBox._nextTrackId = data.subarray(0, 4).toUint();
        }

        return isoMovieHeaderBox;
    }

    // TODO: properties CreationTime and ModificationTime are not yet implemented. There were no references to them in the original code.

    /**
     * Gets the duration of the movie represented by the current instance.
     */
    public get durationInMilliseconds(): number {
        // The length is the number of ticks divided by ticks per second.
        // TODO: not sure about conversion to Number here
        return (this._duration / this._timescale) * 1000;
    }

    /**
     *  Gets the playback rate of the movie represented by the current instance.
     */
    public get rate(): number {
        return this._rate / 0x10000;
    }

    /**
     *  Gets the playback volume of the movie represented by the current instance.
     */
    public get volume(): number {
        return this._volume / 0x100;
    }

    /**
     * Gets the ID of the next track in the movie represented by the current instance.
     */
    public get nextTrackId(): number {
        return this._nextTrackId;
    }
}
