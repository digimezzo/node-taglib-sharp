import { ByteVector } from "../../byteVector";

export class IsoHandlerBox {
    /**
     * The handler type of the current instance.
     */
    private _handlerType: ByteVector;

    /**
     * Gets the handler type of the current instance.
     * @returns A ByteVector object containing the handler type of the current instance.
     */
    public get handlerType(): ByteVector {
        return this._handlerType;
    }

    private set handlerType(v: ByteVector) {
        this._handlerType = v;
    }
}
