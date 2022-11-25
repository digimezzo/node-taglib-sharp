import { ByteVector, StringType } from "../../byteVector";
import { File } from "../../file";
import Mpeg4BoxHeader from "../mpeg4BoxHeader";
import FullBox from "./fullBox";
import IsoHandlerBox from "./isoHandlerBox";

/**
 * Descriptor Tags
 */
export enum DescriptorTag {
    Forbidden_00 = 0,
    ObjectDescrTag = 1,
    InitialObjectDescrTag = 2,
    ES_DescrTag = 3,
    DecoderConfigDescrTag = 4,
    DecSpecificInfoTag = 5,
    SLConfigDescrTag = 6,
    ContentIdentDescrTag = 7,
    SupplContentIdentDescrTag = 8,
    IPI_DescrPointerTag = 9,
    IPMP_DescrPointerTag = 10,
    IPMP_DescrTag = 11,
    QoS_DescrTag = 12,
    RegistrationDescrTag = 13,
    ES_ID_IncTag = 14,
    ES_ID_RefTag = 15,
    MP4_IOD_Tag = 16,
    MP4_OD_Tag = 17,
    IPL_DescrPointerRefTag = 18,
    ExtensionProfileLevelDescrTag = 19,
    profileLevelIndicationIndexDescrTag = 20,
    ReservedForFutureISOUse_15_TO_3F = 21,
    ContentClassificationDescrTag = 64,
    KeyWordDescrTag = 65,
    RatingDescrTag = 66,
    LanguageDescrTag = 67,
    ShortTextualDescrTag = 68,
    ExpandedTextualDescrTag = 69,
    ContentCreatorNameDescrTag = 70,
    ContentCreationDateDescrTag = 71,
    OCICreatorNameDescrTag = 72,
    OCICreationDateDescrTag = 73,
    SmpteCameraPositionDescrTag = 74,
    SegmentDescrTag = 75,
    MediaTimeDescrTag = 76,
    ReservedForFutureISOUseOCI = 77,
    IPMP_ToolsListDescrTag = 96,
    IPMP_ToolTag = 97,
    M4MuxTimingDescrTag = 98,
    M4MuxCodeTableDescrTag = 99,
    ExtSLConfigDescrTag = 100,
    M4MuxBufferSizeDescrTag = 101,
    M4MuxIdentDescrTag = 102,
    DependencyPointerTag = 103,
    DependencyMarkerTag = 104,
    M4MuxChannelDescrTag = 105,
    ReservedForFutureISO_6A_TO_BF = 106,
    UserPrivate = 192,
    Forbidden_FF = 255,
}

/**
 * This class extends @see FullBox to provide an implementation of an Apple ElementaryStreamDescriptor.
 * This box may appear as a child of a @see IsoAudioSampleEntry and provided further information about an audio stream.
 */
export default class AppleElementaryStreamDescriptor extends FullBox {
    /**
     * The ES_ID of another elementary stream on which this elementary stream depends
     */
    private _dependsOn_ES_ID: number;

    /**
     * Indicates that a dependsOn_ES_ID will follow
     */
    private _stream_dependence_flag: boolean;

    /**
     * OCR Stream Flag
     */
    private _ocr_stream_flag: boolean;

    /**
     * OCR ES_ID
     */
    private _OCR_ES_Id: number;

    /**
     * Indicates that a URLstring will follow
     */
    private _URL_flag: boolean;

    /**
     * Length of URL String
     */
    private _URLlength: number;

    /**
     * URL String of URLlength, contains a URL that shall point to the location of an SL-packetized stream by name.
     */
    private _URLstring: string;

    /**
     * Indicates that this stream is used for upstream information
     */
    private _upStream: boolean;

    /**
     * Contains the maximum bitrate.
     */
    private _max_bitrate: number;

    /**
     * Contains the average bitrate.
     */
    private _average_bitrate: number;

    /**
     * The ID of the stream described by the current instance.
     */
    private _streamId: number;

    /**
     * The priority of the stream described by the current instance.
     */
    private _streamPriority: number;

    /**
     * The object type ID of the stream described by the current instance.
     */
    private _objectTypeId: number;

    /**
     * The type the stream described by the current instance.
     */
    private _streamType: number;

    /**
     * The buffer size DB value the stream described by the current instance.
     */
    private _bufferSizeDB: number;

    /**
     * The decoder config data of stream described by the current instance.
     */
    private _decoderConfig: ByteVector;

    public constructor() {
        super();
    }

    /**
     * Constructs and initializes a new instance of @see AppleElementaryStreamDescriptor with a provided
     * header and handler by reading the contents from a specified file.
     * @param header A @see Mpeg4BoxHeader object containing the header to use for the new instance.
     * @param file A @see File object to read the contents of the box from.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new instance.
     * @returns A new instance of @see AppleElementaryStreamDescriptor
     */
    public static fromHeaderFileAndHandler(header: Mpeg4BoxHeader, file: File, handler: IsoHandlerBox): AppleElementaryStreamDescriptor {
        /* ES_Descriptor Specifications
         *  Section 7.2.6.5 http://ecee.colorado.edu/~ecen5653/ecen5653/papers/ISO%2014496-1%202004.PDF
         */

        const base: FullBox = FullBox.fromHeaderFileAndHandler(header, file, handler);
        const appleElementaryStreamDescriptor: AppleElementaryStreamDescriptor = base as AppleElementaryStreamDescriptor;

        const box_data: ByteVector = file.readBlock(appleElementaryStreamDescriptor.dataSize);
        appleElementaryStreamDescriptor._decoderConfig = ByteVector.empty();
        let offset: number = 0;

        // Elementary Stream Descriptor Tag
        if (<DescriptorTag>box_data.get(offset++) != DescriptorTag.ES_DescrTag) {
            throw new Error("Invalid Elementary Stream Descriptor, missing tag.");
        }

        // We have a descriptor tag. Check that the remainder of the tag is at least
        // [Base (3 bytes) + DecoderConfigDescriptor (15 bytes) + SLConfigDescriptor (3 bytes) + OtherDescriptors] bytes long
        const es_length: number = appleElementaryStreamDescriptor.readLength(box_data, offset);
        let min_es_length: number = 3 + 15 + 3; // Base minimum length

        if (es_length < min_es_length) {
            throw new Error("Insufficient data present.");
        }

        appleElementaryStreamDescriptor._streamId = box_data.subarray(offset, 2).toUshort();
        offset += 2; // Done with ES_ID

        appleElementaryStreamDescriptor._stream_dependence_flag = <number>((box_data.get(offset) >> 7) & 0x1) == 0x1 ? true : false; // 1st bit
        appleElementaryStreamDescriptor._URL_flag = <number>((box_data.get(offset) >> 6) & 0x1) == 0x1 ? true : false; // 2nd bit
        appleElementaryStreamDescriptor._ocr_stream_flag = <number>((box_data.get(offset) >> 5) & 0x1) == 0x1 ? true : false; // 3rd bit
        appleElementaryStreamDescriptor._streamPriority = <number>(box_data.get(offset++) & 0x1f); // Last 5 bits and we're done with this byte

        if (appleElementaryStreamDescriptor._stream_dependence_flag) {
            min_es_length += 2; // We need 2 more bytes

            if (es_length < min_es_length) {
                throw new Error("Insufficient data present.");
            }

            appleElementaryStreamDescriptor._dependsOn_ES_ID = box_data.subarray(offset, 2).toUshort();
            offset += 2; // Done with stream dependence
        }

        if (appleElementaryStreamDescriptor._URL_flag) {
            min_es_length += 2; // We need 1 more byte

            if (es_length < min_es_length) {
                throw new Error("Insufficient data present.");
            }

            appleElementaryStreamDescriptor._URLlength = box_data.get(offset++); // URL Length
            min_es_length += appleElementaryStreamDescriptor._URLlength; // We need URLength more bytes

            if (es_length < min_es_length) {
                throw new Error("Insufficient data present.");
            }

            appleElementaryStreamDescriptor._URLstring = box_data
                .subarray(offset, appleElementaryStreamDescriptor._URLlength)
                .toString(StringType.UTF8); // URL name
            offset += appleElementaryStreamDescriptor._URLlength; // Done with URL name
        }

        if (appleElementaryStreamDescriptor._ocr_stream_flag) {
            min_es_length += 2; // We need 2 more bytes

            if (es_length < min_es_length) {
                throw new Error("Insufficient data present.");
            }

            appleElementaryStreamDescriptor._OCR_ES_Id = box_data.subarray(offset, 2).toUshort();
            offset += 2; // Done with OCR
        }

        // Loop through all trailing Descriptors Tags
        while (offset < appleElementaryStreamDescriptor.dataSize) {
            const tag: DescriptorTag = <DescriptorTag>box_data.get(offset++);

            switch (tag) {
                case DescriptorTag.DecoderConfigDescrTag: // DecoderConfigDescriptor
                    {
                        // Check that the remainder of the tag is at least 13 bytes long (13 + DecoderSpecificInfo[] + profileLevelIndicationIndexDescriptor[])
                        if (appleElementaryStreamDescriptor.readLength(box_data, offset) < 13) {
                            throw new Error("Could not read data. Too small.");
                        }

                        // Read a lot of good info.
                        appleElementaryStreamDescriptor._objectTypeId = box_data.get(offset++);

                        appleElementaryStreamDescriptor._streamType = <number>(box_data.get(offset) >> 2); // First 6 bits
                        appleElementaryStreamDescriptor._upStream = ((box_data.get(offset++) >> 1) & 0x1) == 0x1 ? true : false; // 7th bit and we're done with the stream bits

                        appleElementaryStreamDescriptor._bufferSizeDB = box_data.subarray(offset, 3).toUint();
                        offset += 3; // Done with bufferSizeDB

                        appleElementaryStreamDescriptor._max_bitrate = box_data.subarray(offset, 4).toUint();
                        offset += 4; // Done with maxBitrate

                        appleElementaryStreamDescriptor._average_bitrate = box_data.subarray(offset, 4).toUint();
                        offset += 4; // Done with avgBitrate

                        // If there's a DecoderSpecificInfo[] array at the end it'll pick it up in the while loop
                    }
                    break;

                case DescriptorTag.DecSpecificInfoTag: // DecoderSpecificInfo
                    {
                        // The rest of the info is decoder specific.
                        const length: number = appleElementaryStreamDescriptor.readLength(box_data, offset);

                        appleElementaryStreamDescriptor._decoderConfig = box_data.subarray(offset, length);
                        offset += length; // We're done with the config
                    }
                    break;

                case DescriptorTag.SLConfigDescrTag: // SLConfigDescriptor
                    {
                        // The rest of the info is SL specific.
                        const length: number = appleElementaryStreamDescriptor.readLength(box_data, offset);

                        offset += length; // Skip the rest of the descriptor as reported in the length so we can move onto the next one
                    }
                    break;

                case DescriptorTag.Forbidden_00:
                case DescriptorTag.Forbidden_FF:
                    throw new Error("Invalid Descriptor tag.");
                default: {
                    /**
                     * TODO: Should we handle other optional descriptor tags?
                     * ExtensionDescriptor extDescr[0 .. 255];
                     * LanguageDescriptor langDescr[0 .. 1];
                     * IPI_DescPointer ipiPtr[0 .. 1];
                     * IP_IdentificationDataSet ipIDS[0 .. 1];
                     * QoS_Descriptor qosDescr[0 .. 1];
                     */
                    const length: number = appleElementaryStreamDescriptor.readLength(box_data, offset); // Every descriptor starts with a length

                    offset += length; // Skip the rest of the descriptor as reported in the length so we can move onto the next one

                    break;
                }
            }
        }

        return appleElementaryStreamDescriptor;
    }

    /**
     * Gets the ID of the stream described by the current instance.
     */
    public get streamId(): number {
        return this._streamId;
    }

    /**
     * Gets the priority of the stream described by the current instance.
     */
    public get streamPriority(): number {
        return this._streamPriority;
    }

    /**
     * Gets the object type ID of the stream described by the current instance.
     */
    public get objectTypeId(): number {
        return this._objectTypeId;
    }

    /**
     * Gets the type the stream described by the current instance.
     */
    public get streamType(): number {
        return this._streamType;
    }

    /**
     * Gets the buffer size DB value the stream described by the current instance.
     */
    public get bufferSizeDB(): number {
        return this._bufferSizeDB;
    }

    /**
     *  Gets the maximum bitrate the stream described by the current instance.
     */
    public get maximumBitrate(): number {
        return this._max_bitrate / 1000;
    }

    /**
     * Gets the maximum average the stream described by the current instance.
     */
    public get averageBitrate(): number {
        return this._average_bitrate / 1000;
    }

    /**
     * Gets the decoder config data of stream described by the current instance.
     */
    public get decoderConfig(): ByteVector {
        return this._decoderConfig;
    }

    /**
     * Reads a section length and updates the offset to the end of of the length block.
     * @param data A @see ByteVector object to read from.
     * @param offset A value reference specifying the offset at which to read. This value gets updated to the
     * position following the size data.
     * @returns A value containing the length that was read.
     */
    public readLength(data: ByteVector, offset: number): number {
        let b: number = 0;
        const end: number = offset + 4;
        let length: number = 0;

        do {
            b = data.get(offset++);
            length = (<number>(length << 7)) | (<number>(b & 0x7f));
        } while ((b & 0x80) !== 0 && offset <= end); // The Length could be between 1 and 4 bytes for each descriptor

        return length;
    }
}
