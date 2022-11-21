import { Genres } from "..";
import { ByteVector, StringType } from "../byteVector";
import { Tag, TagTypes } from "../tag";
import { Guards, StringUtils } from "../utils";
import { AppleAdditionalInfoBox } from "./boxes/appleAdditionalInfoBox";
import { AppleAnnotationBox } from "./boxes/appleAnnotationBox";
import { AppleDataBox, AppleDataBoxFlagType } from "./boxes/appleDataBox";
import { AppleItemListBox } from "./boxes/appleItemListBox";
import { IsoMetaBox } from "./boxes/isoMetaBox";
import { IsoUserDataBox } from "./boxes/isoUserDataBox";
import { Mpeg4Box } from "./mpeg4Box";
import { Mpeg4BoxType } from "./mpeg4BoxType";

export class AppleTag extends Tag {
    /**
     * Contains the ISO meta box in which that tag will be stored.
     */
    private readonly _meta_box: IsoMetaBox;

    /**
     * Contains the ILST box which holds all the values.
     */
    private readonly _ilst_box: AppleItemListBox;

    /**
     * Constructs and initializes a new instance of @see AppleTag for a specified ISO user data box.
     * @param box  A @see IsoUserDataBox from which the tag is to be read.
     */
    public constructor(box: IsoUserDataBox) {
        super();

        Guards.notNullOrUndefined(box, "box");

        this._meta_box = box.getChild(Mpeg4BoxType.meta) as IsoMetaBox;

        if (this._meta_box === null && this._meta_box === undefined) {
            this._meta_box = IsoMetaBox.fromHandlerTypeAndHandlerName(ByteVector.fromString("mdir", StringType.UTF8), null);
            box.addChild(this._meta_box);
        }

        this._ilst_box = this._meta_box.getChild(Mpeg4BoxType.ilst) as AppleItemListBox;

        if (this._ilst_box === null && this._ilst_box === undefined) {
            this._ilst_box = AppleItemListBox.fromEmpty();
            this._meta_box.addChild(this._ilst_box);
        }
    }

    /**
     *  Gets and sets whether or not the album described by the current instance is a compilation.
     */
    public get isCompilation(): boolean {
        return this._value;
    }
    public set isCompilation(v: boolean) {
        this._value = v;
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
    public get text(): string {
        const text: string[] = this.getText(Mpeg4BoxType.nam);
        return text.length === 0 ? undefined : text[0];
    }
    public set text(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.nam, v);
    }

    /**
     * Gets and sets a short description, one-liner. It represents the tagline of the Video/music.
     */
    public get subTitle(): string {
        const text: string[] = this.getText(Mpeg4BoxType.subt);
        return text.length === 0 ? undefined : text[0];
    }
    public set subTitle(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.subt, v);
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
        const text: string[] = this.getText(Mpeg4BoxType.desc);
        return text.length === 0 ? undefined : text[0];
    }
    public set description(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.desc, v);
    }

    /**
     * Gets and sets the performers or artists who performed in
     * the media described by the current instance.
     */
    public get performers(): string[] {
        return this.getText(Mpeg4BoxType.art);
    }
    public set performers(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.art, v);
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
        const ret: string[] = this.getText(Mpeg4BoxType.role);
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

        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.role, v);
    }

    /**
     *  Gets and sets the band or artist who is credited in the
     * creation of the entire album or collection containing the
     * media described by the current instance.
     */
    public get albumArtists(): string[] {
        return this.getText(Mpeg4BoxType.aart);
    }
    public set albumArtists(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.aart, v);
    }

    /**
     *  Gets and sets the composers of the media represented by the current instance.
     */
    public get composers(): string[] {
        return this.getText(Mpeg4BoxType.wrt);
    }
    public set composers(v: string[]) {
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.wrt, v);
    }

    /**
     *  Gets and sets the album of the media represented by the current instance.
     */
    public get album(): string {
        const text: string[] = this.getText(Mpeg4BoxType.alb);
        return text.length === 0 ? undefined : text[0];
    }
    public set album(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.alb, v);
    }

    /**
     *  Gets and sets a user comment on the media represented by the current instance.
     */
    public get comment(): string {
        const text: string[] = this.getText(Mpeg4BoxType.cmt);
        return text.length === 0 ? undefined : text[0];
    }
    public set comment(v: string) {
        this.setTextFromTypeAndText(Mpeg4BoxType.cmt, v);
    }

    /**
     *  Gets and sets the genres of the media represented by the current instance.
     */
    public get genres(): string[] {
        let text: string[] = this.getText(Mpeg4BoxType.gen);
        if (text.length > 0) {
            return text;
        }

        for (const box of this.dataBoxesFromTypeParams(Mpeg4BoxType.gnre)) {
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
        this.clearData(Mpeg4BoxType.gnre);
        this.setTextFromTypeAndTextCollection(Mpeg4BoxType.gen, v);
    }

    /**
     * Gets all data boxes that match any of the provided types.
     * @param types A @see ByteVector[] object enumerating a list of box types to match.
     * @returns A @see AppleDataBox[] object enumerating the matching boxes.
     */
    public dataBoxesFromTypes(types: ByteVector[]): AppleDataBox[] {
        // Check each box to see if the match any of the
        // provided types. If a match is found, loop through the
        // children and add any data box.
        for (const box of this._ilst_box.children) {
            for (const byteVector of types) {
                if (AppleTag.fixId(byteVector).makeReadOnly() !== box.boxType) {
                    continue;
                }

                // TODO: hopefully this is correct. I hate yield return (see original code).
                const data_boxes: AppleDataBox[] = [];

                for (const data_box of box.children) {
                    if (data_box instanceof AppleDataBox) {
                        data_boxes.push(data_box as AppleDataBox);
                    }
                }

                return data_boxes;
            }
        }
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
        for (const box of this._ilst_box.children) {
            if (box.boxType !== Mpeg4BoxType.dash) {
                continue;
            }

            // Get the mean and name boxes, make sure
            // they're legit, and make sure that they match
            // what we want. Then loop through and add all
            // the data box children to our output.
            const mean_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.mean);
            const name_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.theName);

            if (
                mean_box === null ||
                mean_box === undefined ||
                name_box === null ||
                name_box === undefined ||
                mean_box.text !== mean ||
                name_box.text !== name
            ) {
                continue;
            }

            // TODO: hopefully this is correct. I hate yield return (see original code).
            const data_boxes: AppleDataBox[] = [];

            for (const data_box of box.children) {
                if (data_box instanceof AppleDataBox) {
                    data_boxes.push(data_box as AppleDataBox);
                }
            }

            return data_boxes;
        }
    }

    /**
     * Gets all text values contained in a specified box type.
     * @param type A @see ByteVector object containing the box type to match.
     * @returns A @see string[] containing text from all matching boxes.
     */
    public getText(type: ByteVector): string[] {
        var result: string[] = [];

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
        type = AppleTag.fixId(type).makeReadOnly();

        let added: boolean = false;

        for (const box of this._ilst_box.children) {
            if (type === box.boxType) {
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
        this._ilst_box.addChild(box2);

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
        if (data === null || data === undefined || data.length == 0) {
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
            this._ilst_box.removeChildByType(AppleTag.fixId(type).makeReadOnly());

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
        if (StringUtils.isNullOrEmpty(text)) {
            this._ilst_box.removeChildByType(AppleTag.fixId(type).makeReadOnly());

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
        this._ilst_box.removeChildByType(AppleTag.fixId(type).makeReadOnly());
    }

    /**
     * Detaches the internal "ilst" box from its parent element.
     */
    public detachIlst(): void {
        this._meta_box.removeChildByBox(this._ilst_box);
    }

    /**
     * Gets the text string from a specific data box in a Dash (----) atom
     * @param meanstring String specifying text from mean box
     * @param namestring String specifying text from name box
     * @returns Text string from data box
     */
    public getDashBox(meanstring: string, namestring: string): string {
        const data_boxes: AppleDataBox[] = this.getDashAtoms(meanstring, namestring);

        if (data_boxes !== null && data_boxes !== undefined) {
            return data_boxes[0].text;
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
        const data_boxes: AppleDataBox[] = this.getDashAtoms(meanstring, namestring);

        if (data_boxes !== null && data_boxes !== undefined) {
            const box_text: string[] = [];

            for (const data_box of data_boxes) {
                box_text.push(data_box.text);
            }

            return box_text;
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
        const data_box: AppleDataBox = this.getDashAtom(meanstring, namestring);

        // If we did find a data_box and we have an empty datastring we should remove the entire dash box.
        if (data_box !== null && data_box !== undefined && StringUtils.isNullOrEmpty(datastring)) {
            const dash_box: AppleAnnotationBox = this.getParentDashBox(meanstring, namestring);
            dash_box.clearChildren();
            this._ilst_box.removeChildByBox(dash_box);

            return;
        }

        if (data_box !== null && data_box !== undefined) {
            data_box.text = datastring;
        } else {
            // Create the new boxes, should use 1 for text as a flag
            const amean_box: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.mean, 0, 1);
            const aname_box: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.theName, 0, 1);
            const adata_box: AppleDataBox = AppleDataBox.fromDataAndFlags(Mpeg4BoxType.data, 1);
            amean_box.text = meanstring;
            aname_box.text = namestring;
            adata_box.text = datastring;
            var whole_box = AppleAnnotationBox.fromType(Mpeg4BoxType.dash);
            whole_box.addChild(amean_box);
            whole_box.addChild(aname_box);
            whole_box.addChild(adata_box);
            this._ilst_box.addChild(whole_box);
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
        const data_boxes: AppleDataBox[] = this.getDashAtoms(meanstring, namestring);

        // If we did find a data_box and we have an empty datastring we should remove the entire dash box.
        if (data_boxes !== null && data_boxes !== undefined && StringUtils.isNullOrEmpty(datastring[0])) {
            const dash_box: AppleAnnotationBox = this.getParentDashBox(meanstring, namestring);
            dash_box.clearChildren();
            this._ilst_box.removeChildByBox(dash_box);

            return;
        }

        if (data_boxes !== null && data_boxes !== undefined && data_boxes.length === datastring.length) {
            for (let i = 0; i < data_boxes.length; i++) {
                data_boxes[i].text = datastring[i];
            }
        } else {
            // Remove all Boxes
            const dash_box: AppleAnnotationBox = this.getParentDashBox(meanstring, namestring);
            if (dash_box !== null && dash_box !== undefined) {
                dash_box.clearChildren();
                this._ilst_box.removeChildByBox(dash_box);
            }

            const whole_box: AppleAnnotationBox = AppleAnnotationBox.fromType(Mpeg4BoxType.dash);

            for (const text of datastring) {
                // Create the new boxes, should use 1 for text as a flag.
                const amean_box: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.mean, 0, 1);
                const aname_box: AppleAdditionalInfoBox = AppleAdditionalInfoBox.fromTypeVersionAndFlags(Mpeg4BoxType.theName, 0, 1);
                const adata_box: AppleDataBox = AppleDataBox.fromDataAndFlags(Mpeg4BoxType.data, 1);
                amean_box.text = meanstring;
                aname_box.text = namestring;
                adata_box.text = text;
                whole_box.addChild(amean_box);
                whole_box.addChild(aname_box);
                whole_box.addChild(adata_box);
                this._ilst_box.addChild(whole_box);
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
        for (const box of this._ilst_box.children) {
            if (box.boxType != Mpeg4BoxType.dash) {
                continue;
            }

            // Get the mean and name boxes, make sure they're legit, check the Text fields for a match.
            // If we have a match return the AppleDataBox containing the data.
            const mean_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.mean);
            const name_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.theName);

            if (
                mean_box === null ||
                mean_box === undefined ||
                name_box === null ||
                name_box === undefined ||
                mean_box.text !== meanstring ||
                name_box.text.toLowerCase() !== namestring.toLowerCase()
            ) {
                continue;
            } else {
                return <AppleDataBox>box.getChild(Mpeg4BoxType.data);
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
        for (const box of this._ilst_box.children) {
            if (box.boxType != Mpeg4BoxType.dash) {
                continue;
            }

            // Get the mean and name boxes, make sure they're legit, check the Text fields for a match.
            // If we have a match return the AppleDataBox containing the data.
            const mean_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.mean);
            const name_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.theName);

            if (
                mean_box === null ||
                mean_box === undefined ||
                name_box === null ||
                name_box === undefined ||
                mean_box.text !== meanstring ||
                name_box.text.toLowerCase() !== namestring.toLowerCase()
            ) {
                continue;
            } else {
                return box.getChildren(Mpeg4BoxType.data).map((x) => <AppleDataBox>x);
            }
        }

        // If we haven't returned the found box yet, there isn't one, return null
        return null;
    }

    /**
     * Returns the Parent Dash box object for a given mean/name combination
     * @param meanstring String specifying text for mean box
     * @param namestring String specifying text for name box
     * @returns AppleAnnotationBox object that is the parent for the mean/name combination
     */
    private getParentDashBox(meanstring: string, namestring: string): AppleAnnotationBox {
        for (const box of this._ilst_box.children) {
            if (box.boxType != Mpeg4BoxType.dash) {
                continue;
            }

            // Get the mean and name boxes, make sure they're legit, check the Text fields for a match.
            // If we have a match return the AppleAnnotationBox that is the Parent.
            const mean_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.mean);
            const name_box: AppleAdditionalInfoBox = <AppleAdditionalInfoBox>box.getChild(Mpeg4BoxType.theName);

            if (
                mean_box === null ||
                mean_box === undefined ||
                name_box === null ||
                name_box === undefined ||
                mean_box.text !== meanstring ||
                name_box.text !== namestring
            ) {
                continue;
            } else {
                return <AppleAnnotationBox>box;
            }
        }

        // If we haven't returned the found box yet, there isn't one, return null.
        return null;
    }

    /**
     * Converts the provided ID into a readonly ID and fixes a 3 byte ID.
     * @param id A <see cref="ByteVector" /> object containing an ID to fix.
     * @returns A fixed @see ByteVector or undefined if the ID could not be fixed.
     */
    public static fixId(id: ByteVector): ByteVector {
        if (id.length === 4) {
            return id;
        }

        if (id.length === 3) {
            return ByteVector.fromByteArray([0xa9, id.get(0), id.get(1), id.get(2)]);
        }

        return undefined;
    }

    // ----------------------------------------------------------------------------------------------------------
    public tagTypes: TagTypes;

    public get sizeOnDisk(): number {
        // TODO: no idea what to do here
        return 0;
    }

    public clear(): void {
        // TODO: no idea what to do here
    }
}
