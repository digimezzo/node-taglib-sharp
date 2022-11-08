import { ByteVector } from "../../byteVector";
import { Mpeg4Box } from "../mpeg4Box";

export class FullBox extends Mpeg4Box {
    /**
     * Gets the position of the data contained in the current instance, after any box specific headers.
     */
    protected get dataPosition(): number {
        return super.dataPosition + 4;
    }

    /**
     * Gets and sets the version number of the current instance.
     */
    public version: number;

    /**
     * Gets and sets the flags that apply to the current instance.
     */
    public flags: number;

    protected renderUsingTopData(topData: ByteVector): ByteVector {
        // TODO
        return undefined;
    }
}
