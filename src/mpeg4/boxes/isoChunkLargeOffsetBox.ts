import { ByteVector } from "../../byteVector";
import { File } from "../../file";
import { Guards } from "../../utils";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { FullBox } from "./fullBox";
import { IsoHandlerBox } from "./isoHandlerBox";

/**
 *  This class extends @see FullBox to provide an implementation of a ISO/IEC 14496-12 ChunkLargeOffsetBox.
 */
export class IsoChunkLargeOffsetBox extends FullBox {
    /**
     * The offset table contained in the current instance.
     */
    private _offsets: bigint[];

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see IsoChunkLargeOffsetBox with a provided header
     * and handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): IsoChunkLargeOffsetBox {
        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const isoAudioSampleEntry: IsoChunkLargeOffsetBox = base as IsoChunkLargeOffsetBox;

        const box_data: ByteVector = file.readBlock(isoAudioSampleEntry.dataSize);

        isoAudioSampleEntry._offsets = [BigInt(box_data.subarray(0, 4).toUint())]; // TODO: not sure if this conversion is OK (re-check original code)

        for (let i = 0; i < isoAudioSampleEntry._offsets.length; i++) {
            isoAudioSampleEntry._offsets[i] = box_data.subarray(4 + i * 8, 8).toUlong();
        }

        return isoAudioSampleEntry;
    }

    /**
     * Gets and sets the data contained in the current instance.
     */
    public get data(): ByteVector {
        const output: ByteVector = ByteVector.fromUint(this.offsets.length);
        for (let i = 0; i < this.offsets.length; i++) {
            output.addByteVector(ByteVector.fromUlong(this.offsets[i]));
        }

        return output;
    }

    /**
     * Gets the offset table contained in the current instance.
     */
    public get offsets(): bigint[] {
        return this._offsets;
    }

    /**
     * Overwrites the existing box in the file after updating the table for a size change.
     * @param file A @see File object containing the file to which the current instance belongs and wo which modifications
     * must be applied.
     * @param sizeDifference A value containing the size change that occurred in the file.
     * @param after A value containing the position in the file after which offsets will be invalidated. If an
     * offset is before this point, it won't be updated.
     */
    public overwrite(file: File, sizeDifference: bigint, after: bigint): void {
        Guards.notNullOrUndefined(file, "file");

        file.insert(this.renderUsingSizeDifference(sizeDifference, after), this.header.position, this.size);
    }

    /**
     * Renders the current instance after updating the table for a size change.
     * @param sizeDifference  A value containing the size change that occurred in the file.
     * @param after  A value containing the position in the file after which offsets will be invalidated. If an
     * offset is before this point, it won't be updated.
     */
    public renderUsingSizeDifference(sizeDifference: bigint, after: bigint): ByteVector {
        for (let i = 0; i < this.offsets.length; i++) {
            if (this.offsets[i] >= after) {
                this.offsets[i] = this.offsets[i] + sizeDifference;
            }
        }

        return this.render();
    }
}
