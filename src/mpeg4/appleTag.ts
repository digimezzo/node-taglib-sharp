import { ByteVector, StringType } from "../byteVector";
import { Tag, TagTypes } from "../tag";
import { Guards } from "../utils";
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
                if (this.fixId(byteVector) !== box.boxType) {
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
        type = this.fixId(type);

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
            this._ilst_box.removeChildByType(this.fixId(type));

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
        if (text === null || text === undefined || text === "") {
            this._ilst_box.removeChildByType(this.fixId(type));

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
        this._ilst_box.removeChildByType(this.fixId(type));
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

    // ----------------------------------------------------------------------------------------------------------
    public tagTypes: TagTypes;

    public get sizeOnDisk(): number {
        // TODO: no idea what to do here
        return 0;
    }

    public clear(): void {
        // TODO: no idea what to do here
    }

    /**
     *  Fixes a 3 byte ID.
     */
    public static fixId(id: ByteVector): ByteVector {
        if (id.length === 4) {
            return id;
        }

        if (id.length === 3) {
            return ByteVector.fromByteArray([0xa9, id.get(0), id.get(1), id.get(2)]);
        }

        return null;
    }
}
