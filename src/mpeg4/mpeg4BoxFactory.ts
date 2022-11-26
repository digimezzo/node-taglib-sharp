import { File } from "../file";
import IsoHandlerBox from "./boxes/isoHandlerBox";
import Mpeg4Box from "./mpeg4Box";
import Mpeg4BoxHeader from "./mpeg4BoxHeader";
import Mpeg4Utils from "./mpeg4Utils";

/**
 * This class provides support for reading boxes from a file.
 */
export default class Mpeg4BoxFactory {
    /**
     * Creates a box by reading it from a file given its header, parent header, handler, and index in its parent.
     * @param file A @see File object containing the file to read from.
     * @param header A @see Mpeg4BoxHeader object containing the header of the box to create.
     * @param parent A @see Mpeg4BoxHeader object containing the header of the parent box.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new box.
     * @param index  A value containing the index of the new box in its parent.
     * @returns A newly created @see Mpeg4Box object.
     */
    public static createBoxFromFileHeaderParentHandlerAndIndex(
        file: File,
        header: Mpeg4BoxHeader,
        parent: Mpeg4BoxHeader,
        handler: IsoHandlerBox,
        index: number
    ): Mpeg4Box {
        // This code had to split out to separate class Mpeg4Utils to avoid circular dependency in Mpeg4Box.
        return Mpeg4Utils.createBoxFromFileHeaderParentHandlerAndIndex(file, header, parent, handler, index);
    }

    /**
     * Creates a box by reading it from a file given its position in the file, parent header, handler, and index in its parent.
     * @param file A @see File object containing the file to read from.
     * @param position  A value specifying at what seek position in file to start reading.
     * @param parent A @see Mpeg4BoxHeader object containing the header of the parent box.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new box.
     * @param index A value containing the index of the new box in its parent.
     * @returns A newly created @see Mpeg4Box object.
     */
    public static createBoxFromFilePositionParentHandlerAndIndex(
        file: File,
        position: number,
        parent: Mpeg4BoxHeader,
        handler: IsoHandlerBox,
        index: number
    ): Mpeg4Box {
        // This code had to split out to separate class Mpeg4Utils to avoid circular dependency in Mpeg4Box.
        return Mpeg4Utils.createBoxFromFilePositionParentHandlerAndIndex(file, position, parent, handler, index);
    }

    /**
     * Creates a box by reading it from a file given its position in the file and handler.
     * @param file A @see File object containing the file to read from.
     * @param position A value specifying at what seek position in file to start reading.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new box.
     * @returns A newly created @see Mpeg4Box object.
     */
    public static createBoxFromFilePositionAndHandler(file: File, position: number, handler: IsoHandlerBox): Mpeg4Box {
        return Mpeg4BoxFactory.createBoxFromFilePositionAndHandler(file, position, handler);
    }

    /**
     *  Creates a box by reading it from a file given its position in the file.
     * @param file A @see File object containing the file to read from.
     * @param position A value specifying at what seek position in file to start reading.
     * @returns A newly created @see Mpeg4Box object.
     */
    public static createBoxFromFileAndPosition(file: File, position: number): Mpeg4Box {
        return Mpeg4BoxFactory.createBoxFromFilePositionAndHandler(file, position, undefined);
    }

    /**
     * Creates a box by reading it from a file given its header and handler.
     * @param file A @see File object containing the file to read from.
     * @param header A @see Mpeg4BoxHeader object containing the header of the box to create.
     * @param handler A @see IsoHandlerBox object containing the handler that applies to the new box.
     * @returns A newly created @see Mpeg4Box object.
     */
    public static createBoxFromFileHeaderAndHandler(file: File, header: Mpeg4BoxHeader, handler: IsoHandlerBox): Mpeg4Box {
        return Mpeg4BoxFactory.createBoxFromFileHeaderParentHandlerAndIndex(file, header, Mpeg4BoxHeader.empty, handler, -1);
    }

    /**
     * Creates a box by reading it from a file given its header and handler.
     * @param file A @see File object containing the file to read from.
     * @param header A @see Mpeg4BoxHeader object containing the header of the box to create.
     * @returns A newly created @see Mpeg4Box object.
     */
    public static createBoxFromFileAndHeader(file: File, header: Mpeg4BoxHeader): Mpeg4Box {
        return Mpeg4BoxFactory.createBoxFromFileHeaderAndHandler(file, header, undefined);
    }
}
