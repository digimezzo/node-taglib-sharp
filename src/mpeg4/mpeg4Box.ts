import { ByteVector } from "../byteVector";
import IsoHandlerBox from "./boxes/isoHandlerBox";
import Mpeg4BoxHeader from "./mpeg4BoxHeader";

/**
 *  Provides a generic implementation of a ISO/IEC 14496-12 box.
 */
export default class Mpeg4Box {
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
     * @returns An array object enumerating the children of the current instance.
     */
    public get children(): Mpeg4Box[] {
        return this._children;
    }

    /**
     * Gets the handler box that applies to the current instance.
     * @returns A IsoHandlerBox object containing the handler that applies to the current instance, or undefined if no handler applies.
     */
    public get handler(): IsoHandlerBox {
        return this._handler;
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

    public renderUsingTopData(topData: ByteVector): ByteVector {
        // TODO

        return undefined;
    }
}
