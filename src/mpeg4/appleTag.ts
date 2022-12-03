import * as DateFormat from "dateformat";
import { Genres } from "..";
import { ByteVector, StringType } from "../byteVector";
import { Tag, TagTypes } from "../tag";
import { Guards } from "../utils";
import { AppleDataBoxFlagType } from "./appleDataBoxFlagType";
import AppleAnnotationBox, {
    AppleAdditionalInfoBox,
    AppleDataBox,
    AppleItemListBox,
    IsoMetaBox,
    IsoUserDataBox,
    Mpeg4Box,
} from "./mpeg4Boxes";
import Mpeg4BoxType from "./mpeg4BoxType";
import Mpeg4Utils from "./mpeg4Utils";

export default class AppleTag extends Tag {
    /**
     * Gets the size of the tag in bytes on disk as it was read from disk.
     */
    public get sizeOnDisk(): number {
        // TODO: no idea what to do here. This isn't in the original implementation.
        return 0;
    }

    /**
     * Contains the ISO meta box in which that tag will be stored.
     */
    private readonly _metaBox: IsoMetaBox;

    /**
     * Contains the ILST box which holds all the values.
     */
    private readonly _ilstBox: AppleItemListBox;

    /**
     * Constructs and initializes a new instance of @see AppleTag for a specified ISO user data box.
     * @param box  A @see IsoUserDataBox from which the tag is to be read.
     */
    public constructor(box: IsoUserDataBox) {
        super();

        Guards.notNullOrUndefined(box, "box");

        this._metaBox = box.getChild(Mpeg4BoxType.Meta) as IsoMetaBox;

        if (this._metaBox === null || this._metaBox === undefined) {
            this._metaBox = IsoMetaBox.fromHandlerTypeAndHandlerName(ByteVector.fromString("mdir", StringType.UTF8), undefined);
            box.addChild(this._metaBox);
        }

        this._ilstBox = this._metaBox.getChild(Mpeg4BoxType.Ilst) as AppleItemListBox;

        if (this._ilstBox === null || this._ilstBox === undefined) {
            this._ilstBox = AppleItemListBox.fromEmpty();
            this._metaBox.addChild(this._ilstBox);
        }
    }

    /**
     *  Gets and sets whether or not the album described by the current instance is a compilation.
     */
    public get isCompilation(): boolean {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Cpil)) {
            return box.data.toUint() !== 0;
        }

        return false;
    }
    public set isCompilation(v: boolean) {
        // TODO: is it correct to use ByteVector.fromInt here?
        this.setDataFromTypeDataAndFlags(Mpeg4BoxType.Cpil, ByteVector.fromInt(v ? 1 : 0), <number>AppleDataBoxFlagType.ForTempo);
    }

    /**
     * Gets the tag types contained in the current instance.
     */
    public get tagTypes(): TagTypes {
        return TagTypes.Apple;
    }

    /**
     * Gets and sets the title for the media described by the current instance.
     */
    public get title(): string {
        const text: string[] = this.getText(Mpeg4BoxType.Nam);
        return text.length === 0 ? undefined : text[0];
    }
    public set title(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Nam, v);
    }

    /**
     * Gets and sets a short description, one-liner. It represents the tagline of the Video/music.
     */
    public get subTitle(): string {
        const text: string[] = this.getText(Mpeg4BoxType.Subt);
        return text.length === 0 ? undefined : text[0];
    }
    public set subTitle(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Subt, v);
    }

    /**
     * Gets and sets a short description of the media.
     * For a music, this could be the comment that the artist
     * made of its artwork. For a video, this should be a
     * short summary of the story/plot, but a spoiler. This
     * should give the impression of what to expect in the
     * media.
     */
    public get description(): string {
        const text: string[] = this.getText(Mpeg4BoxType.Desc);
        return text.length === 0 ? undefined : text[0];
    }
    public set description(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Desc, v);
    }

    /**
     * Gets and sets the performers or artists who performed in
     * the media described by the current instance.
     */
    public get performers(): string[] {
        return this.getText(Mpeg4BoxType.Art);
    }
    public set performers(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Art, v);
    }

    /**
     * Gets and sets the Charaters for a video media, or
     * instruments played for music media.
     * This should match the <see cref="Performers"/> array (for
     * each person correspond one/more role). Several roles for
     * the same artist/actor can be made up with semicolons.
     * For example, "Marty McFly; Marty McFly Jr.; Marlene McFly".
     */
    public get performersRole(): string[] {
        const ret: string[] = this.getText(Mpeg4BoxType.Role);
        if (ret === null || ret === undefined) {
            return ret;
        }

        // Reformat '/' to ';'
        for (let i = 0; i < ret.length; i++) {
            ret[i] = ret[i].replace("/", ";").trim();
        }

        return ret;
    }
    public set value(v: string[]) {
        const ret: string[] = v;

        if (ret !== null && ret !== undefined) {
            // Reformat ';' to '/'
            for (let i = 0; i < ret.length; i++) {
                ret[i] = ret[i].replace(";", "/");
            }
        }

        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Role, v);
    }

    /**
     *  Gets and sets the band or artist who is credited in the
     * creation of the entire album or collection containing the
     * media described by the current instance.
     */
    public get albumArtists(): string[] {
        return this.getText(Mpeg4BoxType.Aart);
    }
    public set albumArtists(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Aart, v);
    }

    /**
     *  Gets and sets the composers of the media represented by the current instance.
     */
    public get composers(): string[] {
        return this.getText(Mpeg4BoxType.Wrt);
    }
    public set composers(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Wrt, v);
    }

    /**
     *  Gets and sets the album of the media represented by the current instance.
     */
    public get album(): string {
        const text: string[] = this.getText(Mpeg4BoxType.Alb);
        return text.length === 0 ? undefined : text[0];
    }
    public set album(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Alb, v);
    }

    /**
     *  Gets and sets a user comment on the media represented by the current instance.
     */
    public get comment(): string {
        const text: string[] = this.getText(Mpeg4BoxType.Cmt);
        return text.length === 0 ? undefined : text[0];
    }
    public set comment(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Cmt, v);
    }

    /**
     *  Gets and sets the genres of the media represented by the current instance.
     */
    public get genres(): string[] {
        let text: string[] = this.getText(Mpeg4BoxType.Gen);
        if (text.length > 0) {
            return text;
        }

        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Gnre)) {
            if (box.flags !== <number>AppleDataBoxFlagType.ContainsData) {
                continue;
            }

            // iTunes stores genre's in the GNRE box as (ID3# + 1).
            const index: number = box.data.toUshort(true);
            if (index === 0) {
                continue;
            }

            const str: string = Genres.indexToAudio(index - 1, false); // TODO: not sure allowParenthesis should be false here

            if (str === null || str === undefined) {
                continue;
            }

            text = [str];
            break;
        }

        return text;
    }
    public set genres(v: string[]) {
        this.clearData(Mpeg4BoxType.Gnre);
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Gen, v);
    }

    /**
     * Gets and sets the year that the media represented by the current instance was recorded.
     */
    public get year(): number {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Day)) {
            if (box.text !== null && box.text !== undefined) {
                const textWithMaxLengthOfFour: string = box.text.length > 4 ? box.text.substring(0, 4) : box.text;
                const value: number = Number.parseInt(textWithMaxLengthOfFour, 10);

                if (!Number.isNaN(value)) {
                    return value;
                }
            }
        }

        return 0;
    }
    public set year(v: number) {
        if (v === 0) {
            this.clearData(Mpeg4BoxType.Day);
        } else {
            this.setTextFromTypeAndText(Mpeg4BoxType.Day, v.toString());
        }
    }

    /**
     *  Gets and sets the position of the media represented by the current instance in its containing album.
     */
    public get track(): number {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Trkn)) {
            if (box.flags === <number>AppleDataBoxFlagType.ContainsData && box.data.length >= 4) {
                return box.data.subarray(2, 2).toUshort();
            }
        }

        return 0;
    }
    public set track(v: number) {
        const count: number = this.trackCount;

        if (v === 0 && count === 0) {
            this.clearData(Mpeg4BoxType.Trkn);

            return;
        }

        const data: ByteVector = ByteVector.fromUshort(0);
        data.addByteVector(ByteVector.fromUshort(v));
        data.addByteVector(ByteVector.fromUshort(count));
        data.addByteVector(ByteVector.fromUshort(0));

        this.setDataFromTypeDataAndFlags(Mpeg4BoxType.Trkn, data, <number>AppleDataBoxFlagType.ContainsData);
    }

    /**
     * Gets and sets the number of tracks in the album containing the media represented by the current instance.
     */
    public get trackCount(): number {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Trkn)) {
            if (box.flags === <number>AppleDataBoxFlagType.ContainsData && box.data.length >= 6) {
                return box.data.subarray(4, 2).toUshort();
            }
        }

        return 0;
    }
    public set trackCount(v: number) {
        const localTrack = this.track;

        if (v === 0 && localTrack === 0) {
            this.clearData(Mpeg4BoxType.Trkn);

            return;
        }

        const data = ByteVector.fromUshort(0);
        data.addByteVector(ByteVector.fromUshort(localTrack));
        data.addByteVector(ByteVector.fromUshort(v));
        data.addByteVector(ByteVector.fromUshort(0));
        this.setDataFromTypeDataAndFlags(Mpeg4BoxType.Trkn, data, <number>AppleDataBoxFlagType.ContainsData);
    }

    /**
     *   Gets and sets the number of the disc containing the media represented by the current instance in the boxed set.
     */
    public get disc(): number {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Disk)) {
            if (box.flags === <number>AppleDataBoxFlagType.ContainsData && box.data.length >= 4) {
                return box.data.subarray(2, 2).toUshort();
            }
        }

        return 0;
    }
    public set disc(v: number) {
        const localCount = this.discCount;

        if (v === 0 && localCount === 0) {
            this.clearData(Mpeg4BoxType.Disk);

            return;
        }

        const data = ByteVector.fromUshort(0);
        data.addByteVector(ByteVector.fromUshort(v));
        data.addByteVector(ByteVector.fromUshort(localCount));
        data.addByteVector(ByteVector.fromUshort(0));
        this.setDataFromTypeDataAndFlags(Mpeg4BoxType.Disk, data, <number>AppleDataBoxFlagType.ContainsData);
    }

    /**
     *  Gets and sets the number of discs in the boxed set containing the media represented by the current instance.
     */
    public get discCount(): number {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Disk)) {
            if (box.flags === <number>AppleDataBoxFlagType.ContainsData && box.data.length >= 6) {
                return box.data.subarray(4, 2).toUshort();
            }
        }

        return 0;
    }
    public set discCount(v: number) {
        const localDisc = this.disc;

        if (v === 0 && localDisc === 0) {
            this.clearData(Mpeg4BoxType.Disk);

            return;
        }

        const data = ByteVector.fromUshort(0);
        data.addByteVector(ByteVector.fromUshort(localDisc));
        data.addByteVector(ByteVector.fromUshort(v));
        data.addByteVector(ByteVector.fromUshort(0));
        this.setDataFromTypeDataAndFlags(Mpeg4BoxType.Disk, data, <number>AppleDataBoxFlagType.ContainsData);
    }

    /**
     * Gets and sets the lyrics or script of the media represented by the current instance.
     */
    public get lyrics(): string {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Lyr)) {
            return box.text;
        }

        return undefined;
    }
    public set lyrics(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Lyr, v);
    }

    /**
     *  Gets and sets the grouping on the album which the media in the current instance belongs to.
     */
    public get grouping(): string {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Grp)) {
            return box.text;
        }

        return undefined;
    }
    public set grouping(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Grp, v);
    }

    /**
     * Gets and sets the number of beats per minute in the audio of the media represented by the current instance.
     */
    public get beatsPerMinute(): number {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Tmpo)) {
            if (box.flags === <number>AppleDataBoxFlagType.ForTempo) {
                return box.data.toUint();
            }
        }

        return 0;
    }
    public set beatsPerMinute(v: number) {
        if (v === 0) {
            this.clearData(Mpeg4BoxType.Tmpo);

            return;
        }

        this.setDataFromTypeDataAndFlags(Mpeg4BoxType.Tmpo, ByteVector.fromUshort(v), <number>AppleDataBoxFlagType.ForTempo);
    }

    /**
     *  Gets and sets the conductor or director of the media represented by the current instance.
     */
    public get conductor(): string {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Cond)) {
            return box.text;
        }

        return undefined;
    }
    public set conductor(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Cond, v);
    }

    /**
     *  Gets and sets the copyright information for the media represented by the current instance.
     */
    public get copyright(): string {
        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.Cprt)) {
            return box.text;
        }

        return undefined;
    }
    public set copyright(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Cprt, v);
    }

    /**
     * Gets and sets the date at which the tag has been written.
     */
    public get dateTagged(): Date | undefined {
        const text: string[] = this.getText(Mpeg4BoxType.Dtag);
        const strValue: string = text.length === 0 ? undefined : text[0];

        if (strValue) {
            const dateValue = new Date(strValue);

            return isNaN(dateValue.getTime()) ? undefined : dateValue;
        }

        return undefined;
    }
    public set dateTagged(v: Date | undefined) {
        let strValue: string;

        if (v !== null && v !== undefined) {
            strValue = DateFormat(v, "yyyy-mm-dd HH:MM:ss");
            strValue = strValue.replace(" ", "T");
        }

        this.setTextFromTypeAndText(Mpeg4BoxType.Dtag, strValue);
    }

    /**
     * Gets and sets the sort names for the band or artist who is credited in the creation of the entire album or
     * collection containing the media described by the current instance.
     */
    public get albumArtistsSort(): string[] {
        return this.getText(Mpeg4BoxType.Soaa);
    }
    public set albumArtistsSort(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Soaa, v);
    }

    /**
     * Gets and sets the sort names of the performers or artists
     * who performed in the media described by the current instance.
     */
    public get performersSort(): string[] {
        return this.getText(Mpeg4BoxType.Soar);
    }
    public set performersSort(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Soar, v);
    }

    /**
     * Gets and sets the sort names of the Composer credited
     * in the media described by the current instance.
     */
    public get composersSort(): string[] {
        return this.getText(Mpeg4BoxType.Soco);
    }
    public set composersSort(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.Soco, v);
    }

    /**
     * Gets and sets the sort names of the Album Title of
     * the media described by the current instance.
     */
    public get albumSort(): string {
        const text: string[] = this.getText(Mpeg4BoxType.Soal);

        return text.length === 0 ? undefined : text[0];
    }
    public set albumSort(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Soal, v);
    }

    /**
     * Gets and sets the sort names of the Track Title in the
     * media described by the current instance.
     */
    public get titleSort(): string {
        const text: string[] = this.getText(Mpeg4BoxType.Sonm);

        return text.length === 0 ? undefined : text[0];
    }
    public set titleSort(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.Sonm, v);
    }

    /**
     * Gets and sets the MusicBrainz ArtistID
     */
    public get musicBrainzArtistId(): string {
        const artistIds: string[] = this.getDashBoxes("com.apple.iTunes", "MusicBrainz Artist Id");

        return artistIds === null || artistIds === undefined ? undefined : artistIds.join("/");
    }
    public set musicBrainzArtistId(v: string) {
        const artistIds: string[] = v.split("/");
        this.setDashBoxes("com.apple.iTunes", "MusicBrainz Artist Id", artistIds);
    }

    /**
     * Gets and sets the MusicBrainz ReleaseGroupID
     */
    public get musicBrainzReleaseGroupId(): string {
        return this.getDashBox("com.apple.iTunes", "MusicBrainz Release Group Id");
    }
    public set musicBrainzReleaseGroupId(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicBrainz Release Group Id", v);
    }

    /**
     * Gets and sets the MusicBrainz ReleaseID
     */
    public get musicBrainzReleaseId(): string {
        return this.getDashBox("com.apple.iTunes", "MusicBrainz Album Id");
    }
    public set musicBrainzReleaseId(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicBrainz Album Id", v);
    }

    /**
     * Gets and sets the MusicBrainz ReleaseArtistID
     */
    public get musicBrainzReleaseArtistId(): string {
        const releaseArtistIds: string[] = this.getDashBoxes("com.apple.iTunes", "MusicBrainz Album Artist Id");

        return releaseArtistIds === null || releaseArtistIds === undefined ? undefined : releaseArtistIds.join("/");
    }
    public set musicBrainzReleaseArtistId(v: string) {
        const releaseArtistIds: string[] = v.split("/");
        this.setDashBoxes("com.apple.iTunes", "MusicBrainz Album Artist Id", releaseArtistIds);
    }

    /**
     * Gets and sets the MusicBrainz TrackID
     */
    public get musicBrainzTrackId(): string {
        return this.getDashBox("com.apple.iTunes", "MusicBrainz Track Id");
    }
    public set musicBrainzTrackId(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicBrainz Track Id", v);
    }

    /**
     * Gets and sets the MusicBrainz DiscID
     */
    public get musicBrainzDiscId(): string {
        return this.getDashBox("com.apple.iTunes", "MusicBrainz Disc Id");
    }
    public set musicBrainzDiscId(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicBrainz Disc Id", v);
    }

    /**
     * Gets and sets the MusicIP PUID
     */
    public get musicIpId(): string {
        return this.getDashBox("com.apple.iTunes", "MusicIP PUID");
    }
    public set musicIpId(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicIP PUID", v);
    }

    /**
     * Gets and sets the AmazonID
     */
    public get amazonId(): string {
        return this.getDashBox("com.apple.iTunes", "ASIN");
    }
    public set amazonId(v: string) {
        this.setDashBox("com.apple.iTunes", "ASIN", v);
    }

    /**
     * Gets and sets the MusicBrainz ReleaseStatus
     */
    public get musicBrainzReleaseStatus(): string {
        return this.getDashBox("com.apple.iTunes", "MusicBrainz Album Status");
    }
    public set musicBrainzReleaseStatus(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicBrainz Album Status", v);
    }

    /**
     * Gets and sets the MusicBrainz ReleaseType
     */
    public get musicBrainzReleaseType(): string {
        return this.getDashBox("com.apple.iTunes", "MusicBrainz Album Type");
    }
    public set musicBrainzReleaseType(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicBrainz Album Type", v);
    }

    /**
     * Gets and sets the MusicBrainz Release Country
     */
    public get musicBrainzReleaseCountry(): string {
        return this.getDashBox("com.apple.iTunes", "MusicBrainz Album Release Country");
    }
    public set musicBrainzReleaseCountry(v: string) {
        this.setDashBox("com.apple.iTunes", "MusicBrainz Album Release Country", v);
    }

    /**
     * Gets and sets the ReplayGain Track Value of the media represented by the current instance.
     */
    public get replayGainTrackGain(): number {
        let text: string = this.getDashBox("com.apple.iTunes", "REPLAYGAIN_TRACK_GAIN");

        if (text === null || text === undefined) {
            return NaN;
        }

        if (text.toLowerCase().endsWith("db")) {
            text = text.substring(0, text.length - 2).trim();
        }

        const value: number = Number.parseInt(text, 10);

        if (!Number.isNaN(value)) {
            return value;
        }

        return NaN;
    }
    public set replayGainTrackGain(v: number) {
        const text: string = `${Number(v).toFixed(2)} dB`;
        this.setDashBox("com.apple.iTunes", "REPLAYGAIN_TRACK_GAIN", text);
    }

    /**
     * Gets and sets the ReplayGain Peak Value of the media represented by the current instance.
     */
    public get replayGainTrackPeak(): number {
        const text: string = this.getDashBox("com.apple.iTunes", "REPLAYGAIN_TRACK_PEAK");

        if (text === null || text === undefined) {
            return NaN;
        }

        const value: number = Number.parseInt(text, 10);

        if (!Number.isNaN(value)) {
            return value;
        }

        return NaN;
    }
    public set replayGainTrackPeak(v: number) {
        const text: string = Number(v).toFixed(6);
        this.setDashBox("com.apple.iTunes", "REPLAYGAIN_TRACK_PEAK", text);
    }

    /**
     * Gets and sets the ReplayGain Album Value of the media represented by the current instance.
     */
    public get replayGainAlbumGain(): number {
        let text: string = this.getDashBox("com.apple.iTunes", "REPLAYGAIN_ALBUM_GAIN");

        if (text === null || text === undefined) {
            return NaN;
        }

        if (text.toLowerCase().endsWith("db")) {
            text = text.substring(0, text.length - 2).trim();
        }

        const value: number = Number.parseInt(text, 10);

        if (!Number.isNaN(value)) {
            return value;
        }

        return NaN;
    }
    public set replayGainAlbumGain(v: number) {
        const text: string = `${Number(v).toFixed(2)} dB`;
        this.setDashBox("com.apple.iTunes", "REPLAYGAIN_ALBUM_GAIN", text);
    }

    /**
     * Gets and sets the ReplayGain Album Peak Value of the media represented by the current instance.
     */
    public get replayGainAlbumPeak(): number {
        const text: string = this.getDashBox("com.apple.iTunes", "REPLAYGAIN_ALBUM_PEAK");

        if (text === null || text === undefined) {
            return NaN;
        }

        const value: number = Number.parseInt(text, 10);

        if (!Number.isNaN(value)) {
            return value;
        }

        return NaN;
    }
    public set replayGainAlbumPeak(v: number) {
        const text: string = Number(v).toFixed(6);
        this.setDashBox("com.apple.iTunes", "REPLAYGAIN_ALBUM_PEAK", text);
    }

    /**
     * Gets and sets the InitialKey
     */
    public get initialKey(): string {
        return this.getDashBox("com.apple.iTunes", "initialkey");
    }
    public set initialKey(v: string) {
        this.setDashBox("com.apple.iTunes", "initialkey", v);
    }

    /**
     * Gets and sets the ISRC
     */
    public get isrc(): string {
        return this.getDashBox("com.apple.iTunes", "ISRC");
    }
    public set isrc(v: string) {
        this.setDashBox("com.apple.iTunes", "ISRC", v);
    }

    /**
     * Gets and sets the Publisher
     */
    public get publisher(): string {
        return this.getDashBox("com.apple.iTunes", "publisher");
    }
    public set publisher(v: string) {
        this.setDashBox("com.apple.iTunes", "publisher", v);
    }

    /**
     * Gets and sets the Remixer
     */
    public get remixedBy(): string {
        return this.getDashBox("com.apple.iTunes", "REMIXEDBY");
    }
    public set remixedBy(v: string) {
        this.setDashBox("com.apple.iTunes", "REMIXEDBY", v);
    }

    /**
     * Gets whether or not the current instance is empty.
     */
    public get isEmpty(): boolean {
        return !this._ilstBox.hasChildren;
    }

    /**
     * Clears the values stored in the current instance.
     */
    public clear(): void {
        this._ilstBox.clearChildren();
    }

    /**
     * Gets all data boxes that match any of the provided types.
     * @param types A @see ByteVector[] object enumerating a list of box types to match.
     * @returns A @see AppleDataBox[] object enumerating the matching boxes.
     */
    public dataBoxesFromTypes(types: ByteVector[]): AppleDataBox[] {
        const dataBoxes: AppleDataBox[] = [];

        /**
         * Check each box to see if the match any of the provided types.
         * If a match is found, loop through the children and add any data box.
         */
        for (const box of this._ilstBox.children) {
            for (const byteVector of types) {
                if (ByteVector.compare(Mpeg4Utils.fixId(byteVector).makeReadOnly(), box.boxType) !== 0) {
                    continue;
                }

                // TODO: hopefully this is correct. I hate yield return (see original code).
                for (const dataBox of box.children) {
                    if (dataBox instanceof AppleDataBox) {
                        dataBoxes.push(dataBox as AppleDataBox);
                    }
                }
            }
        }

        return dataBoxes;
    }

    /**
     * Gets all data boxes that match any of the provided types.
     * @param types A @see ByteVector[] containing list of box types to match.
     * @returns A @see AppleDataBox[] object enumerating the matching boxes.
     */
    public dataBoxesFromTypeParams(...types: ByteVector[]): AppleDataBox[] {
        return this.dataBoxesFromTypes(types);
    }

    /**
     * Gets all custom data boxes that match the specified mean and name pair.
     * @param mean A @see string object containing the "mean" to match.
     * @param name A @see string object containing the name to match.
     * @returns A @see AppleDataBox[] object enumerating the matching boxes.
     */
    public DataBoxesFromMeanAndName(mean: string, name: string): AppleDataBox[] {
        // These children will have a box type of "----"
        for (const box of this._ilstBox.children) {
            if (ByteVector.compare(box.boxType, Mpeg4BoxType.DASH) !== 0) {
                continue;
            }

            // Get the mean and name boxes, make sure
            // they're legit, and make sure that they match
            // what we want. Then loop through and add all
            // the data box children to our output.
            const meanBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Mean);
            const nameBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Name);

            if (
                meanBox === null ||
                meanBox === undefined ||
                nameBox === null ||
                nameBox === undefined ||
                meanBox.text !== mean ||
                nameBox.text !== name
            ) {
                continue;
            }

            // TODO: hopefully this is correct. I hate yield return (see original code).
            const dataBoxes: AppleDataBox[] = [];

            for (const dataBox of box.children) {
                if (dataBox instanceof AppleDataBox) {
                    dataBoxes.push(dataBox as AppleDataBox);
                }
            }

            return dataBoxes;
        }
    }

    /**
     * Gets all text values contained in a specified box type.
     * @param type A @see ByteVector object containing the box type to match.
     * @returns A @see string[] containing text from all matching boxes.
     */
    public getText(type: ByteVector): string[] {
        const result: string[] = [];

        for (const box of this.dataBoxesFromTypeParams(type)) {
            if (box.text === null || box.text === undefined) {
                continue;
            }

            for (const text of box.text.split(";")) {
                result.push(text.trim());
            }
        }

        return result;
    }

    /**
     * Sets the data for a specified box type to a collection of boxes.
     * @param type  A @see ByteVector object containing the type to add to the new instance.
     * @param boxes A @see AppleDataBox[] containing boxes to add for the specified type.
     */
    public setDataFromTypeAndBoxes(type: ByteVector, boxes: AppleDataBox[]): void {
        // Fix the type.
        type = Mpeg4Utils.fixId(type).makeReadOnly();

        let added: boolean = false;

        for (const box of this._ilstBox.children) {
            if (ByteVector.compare(type, box.boxType) === 0) {
                // Clear the box's children.
                box.clearChildren();

                // If we've already added new children, continue.
                if (added) {
                    continue;
                }

                added = true;

                // Add the children.
                for (const appleDataBox of boxes) {
                    box.addChild(appleDataBox);
                }
            }
        }

        if (added) {
            return;
        }

        const box2: Mpeg4Box = AppleAnnotationBox.fromType(type);
        this._ilstBox.addChild(box2);

        for (const appleDataBox of boxes) {
            box2.addChild(appleDataBox);
        }
    }

    /**
     * Sets the data for a specified box type using values from @see ByteVectorCollection object.
     * @param type A @see ByteVector object containing the type to add to the new instance.
     * @param data A @see ByteVector[] object containing data to add for the specified type.
     * @param flags A value containing flags to use for the added boxes.
     */
    public setDataFromTypeDataCollectionAndFlags(type: ByteVector, dataCollection: ByteVector[], flags: number): void {
        if (dataCollection === null || dataCollection === undefined || dataCollection.length === 0) {
            this.clearData(type);

            return;
        }

        const boxes: AppleDataBox[] = [];

        for (const data of dataCollection) {
            boxes.push(AppleDataBox.fromDataAndFlags(data, flags));
        }

        this.setDataFromTypeAndBoxes(type, boxes);
    }

    /**
     * Sets the data for a specified box type using a single @see ByteVector object.
     * @param type A @see ByteVector object containing the type to add to the new instance.
     * @param data A @see ByteVector object containing data to add for the specified type.
     * @param flags A value containing flags to use for the added box.
     */
    public setDataFromTypeDataAndFlags(type: ByteVector, data: ByteVector, flags: number): void {
        if (data === null || data === undefined || data.length === 0) {
            this.clearData(type);
        } else {
            this.setDataFromTypeDataCollectionAndFlags(type, [data], flags);
        }
    }

    /**
     * Sets the text for a specified box type.
     * @param type A @see ByteVector object containing the type to add to the new instance.
     * @param text A @see string[] containing text to store.
     */
    public setTextFromTypeAndTextCollection(type: ByteVector, textCollection: string[]): void {
        // Remove empty data and return.
        if (textCollection === null || textCollection === undefined) {
            this._ilstBox.removeChildByType(Mpeg4Utils.fixId(type).makeReadOnly());

            return;
        }

        this.setTextFromTypeAndText(type, textCollection.join("; "));
    }

    /**
     * Sets the text for a specified box type.
     * @param type A @see ByteVector object containing the type to add to the new instance.
     * @param text A @see string object containing text to store.
     */
    public setTextFromTypeAndText(type: ByteVector, text: string): void {
        // Remove empty data and return.
        if (!text) {
            this._ilstBox.removeChildByType(Mpeg4Utils.fixId(type).makeReadOnly());

            return;
        }

        const l: ByteVector[] = [ByteVector.fromString(text, StringType.UTF8)];

        this.setDataFromTypeDataCollectionAndFlags(type, l, <number>AppleDataBoxFlagType.ContainsText);
    }

    /**
     * Clears all data for a specified box type.
     * @param type A @see ByteVector object containing the type of box to remove from the current instance.
     */
    public clearData(type: ByteVector): void {
        this._ilstBox.removeChildByType(Mpeg4Utils.fixId(type).makeReadOnly());
    }

    /**
     * Detaches the internal "ilst" box from its parent element.
     */
    public detachIlst(): void {
        this._metaBox.removeChildByBox(this._ilstBox);
    }

    /**
     * Gets the text string from a specific data box in a Dash (----) atom
     * @param meanstring String specifying text from mean box
     * @param namestring String specifying text from name box
     * @returns Text string from data box
     */
    public getDashBox(meanstring: string, namestring: string): string {
        const dataBoxes: AppleDataBox[] = this.getDashAtoms(meanstring, namestring);

        if (dataBoxes !== null && dataBoxes !== undefined) {
            return dataBoxes[0].text;
        } else {
            return undefined;
        }
    }

    /**
     * Gets the text strings from a specific data boxes in Dash (----) atoms
     * @param meanstring String specifying text from mean box
     * @param namestring String specifying text from name box
     * @returns Text string from data box
     */
    public getDashBoxes(meanstring: string, namestring: string): string[] {
        const dataBoxes: AppleDataBox[] = this.getDashAtoms(meanstring, namestring);

        if (dataBoxes !== null && dataBoxes !== undefined) {
            const boxText: string[] = [];

            for (const dataBox of dataBoxes) {
                boxText.push(dataBox.text);
            }

            return boxText;
        } else {
            return undefined;
        }
    }

    /**
     * Sets a specific strings in Dash (----) atom.  This method updates
     * and existing atom, or creates a new one.  If an empty datastring is
     * specified, the Dash box and its children are removed.
     * @param meanstring String specifying text for mean box
     * @param namestring String specifying text for name box
     * @param datastring String specifying text for data box
     */
    public setDashBox(meanstring: string, namestring: string, datastring: string): void {
        const dataBox: AppleDataBox = this.getDashAtom(meanstring, namestring);

        // If we did find a data_box and we have an empty datastring we should remove the entire dash box.
        if (dataBox !== null && dataBox !== undefined && !datastring) {
            const dashBox: AppleAnnotationBox = this.getParentDashBox(meanstring, namestring);
            dashBox.clearChildren();
            this._ilstBox.removeChildByBox(dashBox);

            return;
        }

        if (dataBox !== null && dataBox !== undefined) {
            dataBox.text = datastring;
        } else {
            // Create the new boxes, should use 1 for text as a flag
            const ameanBox: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.Mean, 0, 1);
            const anameBox: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.Name, 0, 1);
            const adataBox: AppleDataBox = AppleDataBox.fromDataAndFlags(Mpeg4BoxType.Data, 1);
            ameanBox.text = meanstring;
            anameBox.text = namestring;
            adataBox.text = datastring;
            const wholeBox = AppleAnnotationBox.fromType(Mpeg4BoxType.DASH);
            wholeBox.addChild(ameanBox);
            wholeBox.addChild(anameBox);
            wholeBox.addChild(adataBox);
            this._ilstBox.addChild(wholeBox);
        }
    }

    /**
     * Sets specific strings in Dash (----) atom.  This method updates
     * existing atoms, or creates new one.  If an empty datastring is
     * specified, the Dash boxes and its children are removed.
     * @param meanstring String specifying text for mean box
     * @param namestring String specifying text for name box
     * @param datastring String values specifying text for data boxes
     */
    public setDashBoxes(meanstring: string, namestring: string, datastring: string[]): void {
        const dataBoxes: AppleDataBox[] = this.getDashAtoms(meanstring, namestring);

        // If we did find a data_box and we have an empty datastring we should remove the entire dash box.
        if (dataBoxes !== null && dataBoxes !== undefined && !datastring[0]) {
            const dashBox: AppleAnnotationBox = this.getParentDashBox(meanstring, namestring);
            dashBox.clearChildren();
            this._ilstBox.removeChildByBox(dashBox);

            return;
        }

        if (dataBoxes !== null && dataBoxes !== undefined && dataBoxes.length === datastring.length) {
            for (let i = 0; i < dataBoxes.length; i++) {
                dataBoxes[i].text = datastring[i];
            }
        } else {
            // Remove all Boxes
            const dashBox: AppleAnnotationBox = this.getParentDashBox(meanstring, namestring);
            if (dashBox !== null && dashBox !== undefined) {
                dashBox.clearChildren();
                this._ilstBox.removeChildByBox(dashBox);
            }

            const wholeBox: AppleAnnotationBox = AppleAnnotationBox.fromType(Mpeg4BoxType.DASH);

            for (const text of datastring) {
                // Create the new boxes, should use 1 for text as a flag.
                const ameanBox: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.Mean, 0, 1);
                const anameBox: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.Name, 0, 1);
                const adataBox: AppleDataBox = AppleDataBox.fromDataAndFlags(Mpeg4BoxType.Data, 1);
                ameanBox.text = meanstring;
                anameBox.text = namestring;
                adataBox.text = text;
                wholeBox.addChild(ameanBox);
                wholeBox.addChild(anameBox);
                wholeBox.addChild(adataBox);
                this._ilstBox.addChild(wholeBox);
            }
        }
    }

    /**
     * Gets the AppleDataBox that corresponds to the specified mean and name values.
     * @param meanstring String specifying text for mean box
     * @param namestring String specifying text for name box
     * @returns Existing AppleDataBox or undefined if one does not exist
     */
    private getDashAtom(meanstring: string, namestring: string): AppleDataBox {
        for (const box of this._ilstBox.children) {
            if (ByteVector.compare(box.boxType, Mpeg4BoxType.DASH) !== 0) {
                continue;
            }

            // Get the mean and name boxes, make sure they're legit, check the Text fields for a match.
            // If we have a match return the AppleDataBox containing the data.
            const meanBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Mean);
            const nameBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Name);

            if (
                meanBox === null ||
                meanBox === undefined ||
                nameBox === null ||
                nameBox === undefined ||
                meanBox.text !== meanstring ||
                nameBox.text.toLowerCase() !== namestring.toLowerCase()
            ) {
                continue;
            } else {
                return <AppleDataBox>box.getChild(Mpeg4BoxType.Data);
            }
        }

        // If we haven't returned the found box yet, there isn't one, return null
        return undefined;
    }

    /**
     * Gets the AppleDataBox that corresponds to the specified mean and name values.
     * @param meanstring String specifying text for mean box
     * @param namestring String specifying text for name box
     * @returns Existing AppleDataBox or null if one does not exist
     */
    private getDashAtoms(meanstring: string, namestring: string): AppleDataBox[] {
        for (const box of this._ilstBox.children) {
            if (ByteVector.compare(box.boxType, Mpeg4BoxType.DASH) !== 0) {
                continue;
            }

            // Get the mean and name boxes, make sure they're legit, check the Text fields for a match.
            // If we have a match return the AppleDataBox containing the data.
            const meanBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Mean);
            const nameBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Name);

            if (
                meanBox === null ||
                meanBox === undefined ||
                nameBox === null ||
                nameBox === undefined ||
                meanBox.text !== meanstring ||
                nameBox.text.toLowerCase() !== namestring.toLowerCase()
            ) {
                continue;
            } else {
                return box.getChildren(Mpeg4BoxType.Data).map((x) => <AppleDataBox>x);
            }
        }

        // If we haven't returned the found box yet, there isn't one, return undefined.
        return undefined;
    }

    /**
     * Returns the Parent Dash box object for a given mean/name combination
     * @param meanstring String specifying text for mean box
     * @param namestring String specifying text for name box
     * @returns AppleAnnotationBox object that is the parent for the mean/name combination
     */
    private getParentDashBox(meanstring: string, namestring: string): AppleAnnotationBox {
        for (const box of this._ilstBox.children) {
            if (ByteVector.compare(box.boxType, Mpeg4BoxType.DASH) !== 0) {
                continue;
            }

            // Get the mean and name boxes, make sure they're legit, check the Text fields for a match.
            // If we have a match return the AppleAnnotationBox that is the Parent.
            const meanBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Mean);
            const nameBox: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.Name);

            if (
                meanBox === null ||
                meanBox === undefined ||
                nameBox === null ||
                nameBox === undefined ||
                meanBox.text !== meanstring ||
                nameBox.text !== namestring
            ) {
                continue;
            } else {
                return <AppleAnnotationBox>box;
            }
        }

        // If we haven't returned the found box yet, there isn't one, return undefined.
        return undefined;
    }
}
