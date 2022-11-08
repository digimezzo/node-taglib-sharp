import { ByteVector } from "../byteVector";
import { File } from "../file";
import { Guards } from "../utils";
import { IsoFreeSpaceBox } from "./boxes/isoFreeSpaceBox";
import { IsoHandlerBox } from "./boxes/isoHandlerBox";
import { Mpeg4BoxFactory } from "./mpeg4BoxFactory";
import { Mpeg4BoxHeader } from "./mpeg4BoxHeader";
import { Mpeg4BoxType } from "./mpeg4BoxType";

/**
 *  Provides a generic implementation of a ISO/IEC 14496-12 box.
 */
export class Mpeg4Box {
    /**
     * Contains the box header.
     */
    private _header: Mpeg4BoxHeader;

    /**
     * Contains the position of the box data.
     */
    private _dataPosition: number;

    /**
     * The handler box that applies to the current instance.
     */
    private _handler: IsoHandlerBox;

    /**
     * The children of the current instance.
     */
    private _children: Mpeg4Box[] = undefined;

    /**
     * Constructs and initializes a new instance of Mpeg4Box with a specified header and handler.
     * @param header A Mpeg4BoxHeader object describing the new instance.
     * @param handler A IsoHandlerBox object containing the handler that applies to the new instance, or undefined if no handler applies.
     * @returns A new instance of Mpeg4Box with a specified header and handler.
     */
    public static fromHeaderAndHandler(header: Mpeg4BoxHeader, handler: IsoHandlerBox): Mpeg4Box {
        const box: Mpeg4Box = new Mpeg4Box();

        return box;
    }

    /**
     * Constructs and initializes a new instance of Mpeg4Box with a specified header.
     * @param header A Mpeg4BoxHeader object describing the new instance.
     * @returns A new instance of Mpeg4Box with a specified header.
     */
    public static fromHeader(header: Mpeg4BoxHeader): Mpeg4Box {
        const box: Mpeg4Box = new Mpeg4Box();

        return this.fromHeaderAndHandler(header, undefined);
    }

    /**
     * Constructs and initializes a new instance of Mpeg4Box with a specified box type.
     * @param type A ByteVector object containing the box type to use for the new instance.
     * @returns A new instance of Mpeg4Box with a specified box type.
     */
    public static fromType(type: ByteVector): Mpeg4Box {
        const box: Mpeg4Box = new Mpeg4Box();

        return this.fromHeader(Mpeg4BoxHeader.fromType(type));
    }

    /**
     * Gets the MPEG-4 box type of the current instance.
     * @returns A ByteVector object containing the four byte box type of the current instance.
     */
    public get boxType(): ByteVector {
        return this._header.boxType;
    }

    /**
     * Gets the total size of the current instance as it last appeared on disk.
     * @returns  A number value containing the total size of the current instance as it last appeared on disk.
     */
    public get size(): number {
        return this._header.totalBoxSize;
    }

    /**
     * Gets and sets the data contained in the current instance.
     * @returns A ByteVector object containing the data contained in the current instance.
     */
    public get data(): ByteVector {
        return undefined;
    }
    public set data(v: ByteVector) {}

    /**
     * Gets the children of the current instance.
     * @returns An Mpeg4Box[] object enumerating the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._children;
    }

    /**
     * Gets whether or not the current instance has children.
     * @returns A boolean value indicating whether or not the current instance has any children.
     */
    public get hasChildren(): boolean {
        return this.children !== null && this.children !== undefined && this.children.length > 0;
    }

    /**
     * Gets the handler box that applies to the current instance.
     * @returns A IsoHandlerBox object containing the handler that applies to the current instance, or undefined if no handler applies.
     */
    public get handler(): IsoHandlerBox {
        return this._handler;
    }

    /**
     * Gets the size of the data contained in the current instance, minus the size of any box specific headers.
     * @returns A number value containing the size of the data contained in the current instance.
     */
    protected get dataSize(): number {
        return this._header.dataSize + this._dataPosition - this.dataPosition;
    }

    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     * @returns A number value containing the position of the data contained in the current instance.
     */
    protected get dataPosition(): number {
        return this._dataPosition;
    }

    /**
     * Gets the header of the current instance.
     * @returns A Mpeg4BoxHeader object containing the header of the current instance.
     */
    protected get header(): Mpeg4BoxHeader {
        return this._header;
    }

    /**
     * Renders the current instance, including its children, to a new ByteVector object.
     * @returns A ByteVector object containing the rendered version of the current instance.
     */
    public render(): ByteVector {
        return this.renderUsingTopData(ByteVector.empty());
    }

    /**
     *  Gets a child box from the current instance by finding a matching box type.
     * @param type  A ByteVector object containing the box type to match.
     * @returns  A Mpeg4Box object containing the matched box, or undefined if no matching box was found.
     */
    public getChild(type: ByteVector): Mpeg4Box {
        if (this.children === null || this.children === undefined) {
            return undefined;
        }

        for (const box of this.children) {
            if (box.boxType === type) {
                return box;
            }
        }

        return undefined;
    }

    /**
     * Gets all child boxes from the current instance by finding a matching box type.
     * @param type A ByteVector object containing the box type to match.
     * @returns A List of Mpeg4Box objects containing the matched box, or undefined if no matching boxes was found.
     */
    public getChildren(type: ByteVector): Mpeg4Box[] {
        if (this.children === null || this.children === undefined) {
            return undefined;
        }

        const boxes: Mpeg4Box[] = [];

        for (const box of this.children) {
            if (box.boxType === type) {
                boxes.push(box);
            }
        }

        if (boxes.length > 0) {
            return boxes;
        }

        return undefined;
    }

    /**
     * Gets a child box from the current instance by finding a matching box type, searching recursively.
     * @param type  A ByteVector object containing the box type to match.
     * @returns A Mpeg4Box object containing the matched box, or undefined if no matching box was found.
     */
    public getChildRecursively(type: ByteVector): Mpeg4Box {
        if (this.children === null || this.children === undefined) {
            return undefined;
        }

        for (const box of this.children) {
            if (box.boxType === type) {
                return box;
            }
        }

        for (const box of this.children) {
            const childBox: Mpeg4Box = box.getChildRecursively(type);

            if (childBox !== null && childBox !== undefined) {
                return childBox;
            }
        }

        return undefined;
    }

    /**
     * Removes all children with a specified box type from the current instance.
     * @param type A ByteVector object containing the box type to remove.
     */
    public removeChildByType(type: ByteVector): void {
        if (this.children === null || this.children === undefined) {
            return;
        }

        for (const box of this.children) {
            if (box.boxType === type) {
                const index = this.children.indexOf(box);

                if (index > -1) {
                    this.children.splice(index, 1);
                }
            }
        }
    }

    /**
     * Removes a specified box from the current instance.
     * @param box A Mpeg4Box object to remove from the current instance.
     */
    public removeChildByBox(box: Mpeg4Box): void {
        if (this.children === null || this.children === undefined) {
            return;
        }

        const index = this.children.indexOf(box);

        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    /**
     * Adds a specified box to the current instance.
     * @param box A Mpeg4Box object to add to the current instance.
     */
    public addChild(box: Mpeg4Box): void {
        if (this.children === null || this.children === undefined) {
            return;
        }

        this.children.push(box);
    }

    /**
     * Removes all children from the current instance.
     */
    public clearChildren(): void {
        if (this.children === null || this.children === undefined) {
            return;
        }

        this._children = [];
    }

    /**
     * Loads the children of the current instance from a specified file using the internal data position and size.
     * @param file The File from which the current instance was read and from which to read the children.
     * @returns A Mpeg4Box[] object enumerating the boxes read from the file.
     */
    public loadChildren(file: File): Mpeg4Box[] {
        Guards.notNullOrUndefined(file, "file");

        const children: Mpeg4Box[] = [];

        let position: number = this.dataPosition;
        const end: number = position + this.dataSize;

        this._header.box = this;

        while (position < end) {
            const child: Mpeg4Box = Mpeg4BoxFactory.createBox(file, position, this._header, this.handler, children.length);

            if (child.size === 0) {
                break;
            }

            children.push(child);
            position += child.size;
        }

        this._header.box = undefined;

        return children;
    }

    /**
     * Loads the data of the current instance from a specified file using the internal data position and size.
     * @param file The File from which the current instance was read and from which to read the data.
     * @returns A ByteVector object containing the data read from the file.
     */
    public loadData(file: File): ByteVector {
        Guards.notNullOrUndefined(file, "file");

        file.seek(this.dataPosition);

        return file.readBlock(this.dataSize);
    }

    /**
     *
     * @param topData
     * @returns
     */
    public renderUsingTopData(topData: ByteVector): ByteVector {
        let freeFound = false;
        const output: ByteVector = ByteVector.empty();

        if (this.children !== null && this.children !== undefined) {
            for (const box of this.children) {
                if (box instanceof IsoFreeSpaceBox) {
                    freeFound = true;
                } else {
                    output.addByteVector(box.render());
                }
            }
        } else if (this.data !== null && this.data !== undefined) {
            output.addByteVector(this.data);
        }

        // If there was a free, don't take it away, and let meta be a special case.
        if (freeFound || this.boxType === Mpeg4BoxType.meta) {
            const sizeDifference: number = this.dataSize - output.length;

            if (this._header.dataSize !== 0 && sizeDifference >= 8) {
                // If we have room for free space, add it so we don't have to resize the file.
                output.addByteVector(IsoFreeSpaceBox.isoFreeSpaceBox_fromPadding(sizeDifference).render());
            } else {
                // If we're getting bigger, get a lot bigger so we might not have to again.
                output.addByteVector(IsoFreeSpaceBox.isoFreeSpaceBox_fromPadding(2048).render());
            }
        }

        // Adjust the header's data size to match the content.
        this._header.dataSize = topData.length + output.length;

        // Render the full box.
        output.insert(0, topData);
        output.insert(0, this._header.render());

        return output;
    }
}
