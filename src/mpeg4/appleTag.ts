import { ByteVector } from "../byteVector";
import { Tag, TagTypes } from "../tag";

export class AppleTag extends Tag {
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
