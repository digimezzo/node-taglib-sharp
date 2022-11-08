export class IsoSampleDescriptionBox {
    /**
     * The number of boxes at the beginning of the children that will be stored as IsoAudioSampleEntry
     * of IsoVisualSampleEntry objects, depending on the handler.
     */
    private _entryCount: number;

    /**
     * Gets the number of boxes at the beginning of the children that will be stored as IsoAudioSampleEntry
     * of IsoVisualSampleEntry objects, depending on the handler.
     * @returns A number value containing the number of children that will appear as sample entries.
     */
    public get entryCount(): number {
        return this._entryCount;
    }
}
