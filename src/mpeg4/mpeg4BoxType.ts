import { ByteVector, StringType } from "../byteVector";
import { AppleTag } from "./appleTag";

/**
 * Provides references to different box types used by the library. This class is used to severely reduce the number
 * of times these types are created in @see AppleTag, greatly improving the speed at which warm files are read.
 */
export class Mpeg4BoxType {
    public static readonly aart = ByteVector.fromString("aART", StringType.UTF8).makeReadOnly();
    public static readonly alb = AppleTag.fixId(ByteVector.fromString("alb", StringType.UTF8)).makeReadOnly();
    public static readonly art = AppleTag.fixId(ByteVector.fromString("ART", StringType.UTF8)).makeReadOnly();
    public static readonly cmt = AppleTag.fixId(ByteVector.fromString("cmt", StringType.UTF8)).makeReadOnly();
    public static readonly cond = ByteVector.fromString("cond", StringType.UTF8).makeReadOnly();
    public static readonly covr = ByteVector.fromString("covr", StringType.UTF8).makeReadOnly();
    public static readonly co64 = ByteVector.fromString("co64", StringType.UTF8).makeReadOnly();
    public static readonly cpil = ByteVector.fromString("cpil", StringType.UTF8).makeReadOnly();
    public static readonly cprt = ByteVector.fromString("cprt", StringType.UTF8).makeReadOnly();
    public static readonly data = ByteVector.fromString("data", StringType.UTF8).makeReadOnly();
    public static readonly day = AppleTag.fixId(ByteVector.fromString("day", StringType.UTF8)).makeReadOnly();
    public static readonly desc = ByteVector.fromString("desc", StringType.UTF8).makeReadOnly();
    public static readonly disk = ByteVector.fromString("disk", StringType.UTF8).makeReadOnly();
    public static readonly dtag = ByteVector.fromString("dtag", StringType.UTF8).makeReadOnly();
    public static readonly esds = ByteVector.fromString("esds", StringType.UTF8).makeReadOnly();
    public static readonly ilst = ByteVector.fromString("ilst", StringType.UTF8).makeReadOnly();
    public static readonly free = ByteVector.fromString("free", StringType.UTF8).makeReadOnly();
    public static readonly gen = AppleTag.fixId(ByteVector.fromString("gen", StringType.UTF8)).makeReadOnly();
    public static readonly gnre = ByteVector.fromString("gnre", StringType.UTF8).makeReadOnly();
    public static readonly grp = AppleTag.fixId(ByteVector.fromString("grp", StringType.UTF8)).makeReadOnly();
    public static readonly hdlr = ByteVector.fromString("hdlr", StringType.UTF8).makeReadOnly();
    public static readonly lyr = AppleTag.fixId(ByteVector.fromString("lyr", StringType.UTF8)).makeReadOnly();
    public static readonly mdat = ByteVector.fromString("mdat", StringType.UTF8).makeReadOnly();
    public static readonly mdia = ByteVector.fromString("mdia", StringType.UTF8).makeReadOnly();
    public static readonly meta = ByteVector.fromString("meta", StringType.UTF8).makeReadOnly();
    public static readonly mean = ByteVector.fromString("mean", StringType.UTF8).makeReadOnly();
    public static readonly minf = ByteVector.fromString("minf", StringType.UTF8).makeReadOnly();
    public static readonly moov = ByteVector.fromString("moov", StringType.UTF8).makeReadOnly();
    public static readonly mvhd = ByteVector.fromString("mvhd", StringType.UTF8).makeReadOnly();
    public static readonly nam = AppleTag.fixId(ByteVector.fromString("nam", StringType.UTF8)).makeReadOnly();
    public static readonly theName = ByteVector.fromString("name", StringType.UTF8).makeReadOnly(); // "theName" because "name" is reserved
    public static readonly role = ByteVector.fromString("role", StringType.UTF8).makeReadOnly();
    public static readonly skip = ByteVector.fromString("skip", StringType.UTF8).makeReadOnly();
    public static readonly soaa = ByteVector.fromString("soaa", StringType.UTF8).makeReadOnly(); // Album Artist Sort
    public static readonly soar = ByteVector.fromString("soar", StringType.UTF8).makeReadOnly(); // Performer Sort
    public static readonly soco = ByteVector.fromString("soco", StringType.UTF8).makeReadOnly(); // Composer Sort
    public static readonly sonm = ByteVector.fromString("sonm", StringType.UTF8).makeReadOnly(); // Track Title Sort
    public static readonly soal = ByteVector.fromString("soal", StringType.UTF8).makeReadOnly(); // Album Title Sort
    public static readonly stbl = ByteVector.fromString("stbl", StringType.UTF8).makeReadOnly();
    public static readonly stco = ByteVector.fromString("stco", StringType.UTF8).makeReadOnly();
    public static readonly stsd = ByteVector.fromString("stsd", StringType.UTF8).makeReadOnly();
    public static readonly subt = ByteVector.fromString("Subt", StringType.UTF8).makeReadOnly();
    public static readonly text = ByteVector.fromString("text", StringType.UTF8).makeReadOnly();
    public static readonly tmpo = ByteVector.fromString("tmpo", StringType.UTF8).makeReadOnly();
    public static readonly trak = ByteVector.fromString("trak", StringType.UTF8).makeReadOnly();
    public static readonly trkn = ByteVector.fromString("trkn", StringType.UTF8).makeReadOnly();
    public static readonly udta = ByteVector.fromString("udta", StringType.UTF8).makeReadOnly();
    public static readonly url = AppleTag.fixId(ByteVector.fromString("url", StringType.UTF8)).makeReadOnly();
    public static readonly uuid = ByteVector.fromString("uuid", StringType.UTF8).makeReadOnly();
    public static readonly wrt = AppleTag.fixId(ByteVector.fromString("wrt", StringType.UTF8)).makeReadOnly();
    public static readonly dash = ByteVector.fromString("----", StringType.UTF8).makeReadOnly();

    // Handler types.
    public static readonly soun = ByteVector.fromString("soun", StringType.UTF8).makeReadOnly();
    public static readonly vide = ByteVector.fromString("vide", StringType.UTF8).makeReadOnly();

    // Another handler type, found in wild in audio file ripped using iTunes.
    public static readonly alis = ByteVector.fromString("alis", StringType.UTF8).makeReadOnly();
}
