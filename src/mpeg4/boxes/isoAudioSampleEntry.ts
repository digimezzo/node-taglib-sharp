import { File } from "../../file";
import { IAudioCodec, MediaTypes } from "../../properties";
import { Guards } from "../../utils";
import { Mpeg4BoxHeader } from "../mpeg4BoxHeader";
import { IsoHandlerBox } from "./isoHandlerBox";
import { IsoSampleEntry } from "./isoSampleEntry";

export class IsoAudioSampleEntry extends IsoSampleEntry implements IAudioCodec {
    public constructor() {
        super();
    }

    audioBitrate: number;
    audioChannels: number;
    audioSampleRate: number;
    description: string;
    durationMilliseconds: number;
    mediaTypes: MediaTypes;

    public static isoAudioSampleEntry_fromHeaderFileAndHandler(
        header: Mpeg4BoxHeader,
        file: File,
        handler: IsoHandlerBox
    ): IsoAudioSampleEntry {
        Guards.notNullOrUndefined(file, "file");

        const isoSampleEntry: IsoSampleEntry = IsoSampleEntry.isoSampleEntry_fromHeaderFileAndHandler(header, file, handler);
        file.seek(isoSampleEntry.dataPosition + 8);
        isoSampleEntry._dataReferenceIndex = file.readBlock(2).toUshort();

        return isoSampleEntry;
    }
}
