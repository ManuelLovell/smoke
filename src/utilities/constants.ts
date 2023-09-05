export class Constants
{
    static EXTENSIONID = "com.battle-system.smoke";
    static VISIONDEFAULT = "30";
    static LABELSID = "com.battle-system.labels";
    static DICENOTATION = /(\d+)[dD](\d+)(.*)$/i;
    static DICEMODIFIER = /([+-])(\d+)/;
    static PARENTHESESMATCH = /\((\d*d\d+\s*([+-]\s*\d+)?)\)/g;
    static PLUSMATCH = /\s(\+\d+)\s/g;
}