import { suite, test } from "@testdeck/mocha";
import { assert } from "chai";
import { ByteVector } from "../../src/byteVector";
import Mpeg4Utils from "../../src/mpeg4/mpeg4Utils";

@suite
class Mpeg4_Mpeg4UtilsTests {
    @test
    public fixId_withIdLengthOf4_returnsUnmodifiedId() {
        // Arrange
        const testByteVector = ByteVector.fromByteArray(new Uint8Array([0x0, 0x1, 0x2, 0x3]));

        // Act/Assert
        assert.strictEqual(Mpeg4Utils.fixId(testByteVector), testByteVector);
    }

    @test
    public fixId_withIdLengthOf3_returnsFixedId() {
        // Arrange
        const testByteVector = ByteVector.fromByteArray(new Uint8Array([0x0, 0x1, 0x2]));
        const expectedByteVector = ByteVector.fromByteArray(new Uint8Array([0xa9, 0x0, 0x1, 0x2]));

        // Act/Assert
        assert.deepEqual(Mpeg4Utils.fixId(testByteVector), expectedByteVector);
    }

    @test
    public fixId_withIdLengthDifferentFrom3And4_returnsUndefined() {
        // Arrange
        const testByteVector = ByteVector.fromByteArray(new Uint8Array([0x0, 0x1]));

        // Act/Assert
        assert.isUndefined(Mpeg4Utils.fixId(testByteVector));
    }
}
