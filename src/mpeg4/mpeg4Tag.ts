import CombinedTag from "../combinedTag";
import { Tag, TagTypes } from "../tag";

export class Mpeg4Tag extends CombinedTag {
    /**
     * Constructs and initializes a new instance with no contents.
     */
    public constructor() {
        super(TagTypes.None, false);
    }

    public createTag(tagType: TagTypes, copy: boolean): Tag {
        throw new Error("Method not implemented.");
    }

    /** @inheritDoc */
    public addTag(tag: Tag): void {
        super.addTag(tag);
    }
}
