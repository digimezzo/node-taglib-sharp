import { suite, test } from "@testdeck/mocha";
import { assert } from "chai";
import { ByteVector, Mpeg4File, ReadStyle } from "../../src";
import { IFileAbstraction } from "../../src/fileAbstraction";
import { default as TestFile } from "../utilities/testFile";

@suite
class Mpeg4Tests {
    private readonly singleValue: string = "01234567890123456789012345678901234567890123456789";
    private readonly multipleValues: string[] = ["A123456789", "B123456789", "C123456789", "D123456789", "E123456789"];
    private readonly genres: string[] = ["Rap", "Jazz", "Non-Genre", "Blues"];

    private createFile(): Mpeg4File {
        const data = new Uint8Array([
            0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0x00, 0x00, 0x00, 0x00, 0x6d, 0x70, 0x34, 0x32, 0x69,
            0x73, 0x6f, 0x6d, 0x00, 0x00, 0x00, 0x08, 0x6d, 0x6f, 0x6f, 0x76,
        ]);

        const fileBytes = ByteVector.fromByteArray(data);

        const testAbstraction: IFileAbstraction = TestFile.getFileAbstraction(fileBytes);

        return new Mpeg4File(testAbstraction, ReadStyle.None);
    }

    @test
    public fromHeaderFileAndHandler_withHeaderFileAndHandler_returnsAppleAdditionalInfoBox() {
        // Arrange
        const file: Mpeg4File = this.createFile();

        // Act
        const initialIsEmpty = file.tag.isEmpty;
        const initialTitle = file.tag.title;

        file.tag.title = this.singleValue;

        const setIsEmpty = file.tag.isEmpty;
        const setTitle = file.tag.title;

        file.tag.title = "";

        const clearedIsEmpty = file.tag.isEmpty;
        const clearedTitle = file.tag.title;

        // Assert
        assert.isTrue(initialIsEmpty);
        assert.isUndefined(initialTitle);

        assert.isFalse(setIsEmpty);
        assert.equal(setTitle, this.singleValue);

        assert.isTrue(clearedIsEmpty);
        assert.isUndefined(clearedTitle);
    }
}
