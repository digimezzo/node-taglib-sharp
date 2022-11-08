import { File, FileAccessMode, ReadStyle } from "../file";
import { IFileAbstraction } from "../fileAbstraction";
import { Properties } from "../properties";
import { Tag, TagTypes } from "../tag";
import { IsoUserDataBox } from "./boxes/isoUserDataBox";
import { Mpeg4FileParser } from "./mpeg4FileParser";
import { Mpeg4Tag } from "./mpeg4Tag";

/**
 * Provides tagging and properties support for Mpeg4 files.
 */
export class Mpeg4File extends File {
    private readonly _properties: Properties;
    private readonly _udtaBoxes: IsoUserDataBox[] = [];
    private readonly _tag: Mpeg4Tag;

    /** @inheritDoc */
    public constructor(file: IFileAbstraction | string, readStyle: ReadStyle) {
        super(file);

        this._tag = new Mpeg4Tag();
        this.mode = FileAccessMode.Read;

        try {
            // Read the file
            const parser = new Mpeg4FileParser(this);

            if ((readStyle & ReadStyle.Average) === 0) {
                parser.parseTag();
            } else {
                parser.parseTagAndProperties();
            }

            // TODO
        } finally {
            this.mode = FileAccessMode.Closed;
        }
    }

    /** @inheritDoc */
    public get tag(): Tag {
        return this._tag;
    }

    /** @inheritDoc */
    public get properties(): Properties {
        return this._properties;
    }

    protected get udtaBoxes(): IsoUserDataBox[] {
        return this._udtaBoxes;
    }

    /** @inheritDoc */
    public getTag(types: TagTypes, create: boolean): Tag {
        // TODO
        return undefined;
    }

    /** @inheritDoc */
    public removeTags(types: TagTypes): void {
        // TODO
    }

    /** @inheritDoc */
    public save(): void {
        // TODO
    }
}

// /////////////////////////////////////////////////////////////////////////
// Register the file type
["taglib/m4a"].forEach((mt) => File.addFileType(mt, Mpeg4File));
