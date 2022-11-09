import { File } from "../file";
import { IsoHandlerBox } from "./boxes/isoHandlerBox";
import { Mpeg4Box } from "./mpeg4Box";
import { Mpeg4BoxHeader } from "./mpeg4BoxHeader";

/**
 * Provides support for reading boxes from a file.
 */
export class Mpeg4BoxFactory {
    public static createBox(file: File, position: number, parent: Mpeg4BoxHeader, handler: IsoHandlerBox, index: number): Mpeg4Box {
        return undefined;
    }
}
