import { styleTags, tags as t } from '@lezer/highlight'

export const klipperConfigHighlighting = styleTags({
    Import: t.keyword,
    ImportKeyword: t.keyword,
    Parameter: t.variableName,
    ConfigBlock: t.keyword,
    AutoGenBlock: t.keyword,
    BlockType: t.keyword,
    Identifier: t.regexp,

    String: t.string,
    Boolean: t.bool,
    Number: t.number,
    Cords: t.number,
    Resolution: t.number,
    Ratio: t.number,
    Pin: t.namespace,
    VirtualPin: t.namespace,
    Path: t.string,
    File: t.string,
    FilePath: t.string,
    Ipv4: t.number,
    Ipv6: t.number,

    AutoGenLineStart: t.regexp,
    AutoGenHeader: t.regexp,
    AutoGenIndent: t.regexp,
    
    Comment: t.comment,
})
