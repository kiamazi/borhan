
import { Page, rtlLangs } from "../../quran-data";

export function contentController(textSelected, translateSelected, pageNumber, ayaNumberInQuran) {
    const text = require(`./assets/text/${textSelected}.js`)
    const translate = require(`./assets/translate/${translateSelected}.js`)

    const match = /(\w+)_\w+/.exec(translateSelected);
    const rtl = rtlLangs.includes(match[1]) ? true : false;
    let data = [];
    for (
        let ayaNumInQuran = Page[pageNumber][2];
        ayaNumInQuran < Page[pageNumber + 1][2];
        ayaNumInQuran++
    ) {
        const suraNum = text[ayaNumInQuran][1] - 1
        const ayaNumInSura = text[ayaNumInQuran][2]
        if (ayaNumInSura === 1 && suraNum !== 0 && suraNum !== 8)
            text[ayaNumInQuran][3] = text[ayaNumInQuran][3].replace(
                /^(([^ ]+ ){4})/u,
                ""
            );
        data.push({
            ayaNumInQuran,
            suraNum,
            ayaNumInSura,
            text: text[ayaNumInQuran][3],
            translate: translate[ayaNumInQuran][3],
            rtl: rtl,
            selected: ayaNumInQuran === ayaNumberInQuran ? true : false,
        });
    }
    return data
}