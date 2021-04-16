import { writable, derived } from 'svelte/store'
import { getSuraNumber, getJuzNumber, getPageNumber, getHizbNumber } from './quran-data';

export const sideBarStatus = writable({
    informations: true,
    settings: false,
    about: false,
    help: false,
    active: true
})

const allKeys = ['darktheme', 'aya', 'text', 'showtext', 'showtranslate', 'translate', 'translatesize', 'textsize'];
for (const key of allKeys) {
    if ((localStorage.getItem(key) !== null)) {
        try {
            JSON.parse(localStorage.getItem(key))
        } catch {
            localStorage.setItem(key, JSON.stringify(localStorage.getItem(key), null, 2))
        }
    }
}

function localStore(key, initial, condition) {

    const toString = (value) => JSON.stringify(value, null, 2)
    const toObj = (value) => JSON.parse(value)
    
    if (condition) {
        localStorage.setItem(key, toString(initial))
    }
    
    const saved = toObj(localStorage.getItem(key))

    const { subscribe, set, update } = writable(saved)

    return {
        subscribe,
        set: (value) => {
            localStorage.setItem(key, toString(value))
            return set(value)
        },
        update
    }
}

export const ayaNumberInQuran = localStore('aya', 0,
    (localStorage.getItem('aya') === null      ||
    isNaN(Number(localStorage.getItem('aya'))) ||
    Number(localStorage.getItem('aya')) < 0    ||
    Number(localStorage.getItem('aya')) > 6235))

export const suraNumber = derived(
    ayaNumberInQuran,
    $ayaNumberInQuran => getSuraNumber(Number($ayaNumberInQuran))
);

export const juzNumber = derived(
    ayaNumberInQuran,
    $ayaNumberInQuran => getJuzNumber(Number($ayaNumberInQuran))
);

export const hizbNumber = derived(
    ayaNumberInQuran,
    $ayaNumberInQuran => getHizbNumber(Number($ayaNumberInQuran))
);

export const pageNumber = derived(
    ayaNumberInQuran,
    $ayaNumberInQuran => getPageNumber(Number($ayaNumberInQuran))
);

const availableTexts = ['quran-simple','quran-simple-plain','quran-simple-min','quran-simple-clean','quran-uthmani','quran-uthmani-min'];
export const textSelected = localStore('text', 'quran-simple', (
    localStorage.getItem('text') === null      ||
    !availableTexts.includes(JSON.parse(localStorage.getItem('text')))
));

const availableTranslates = ['am_sadiq','ar_jalalayn','ar_muyassar','az_mammadaliyev','az_musayev','ber_mensur','bg_theophanov','bn_bengali','bn_hoque','bs_mlivo','de_aburida','de_zaidan','dv_divehi','en_ahmedali','en_ahmedraza','en_arberry','en_daryabadi','en_itani','en_maududi','en_pickthall','en_qarai','en_qaribullah','en_sahih','en_sarwar','en_transliteration','en_wahiduddin','en_yusufali','es_bornez','es_cortes','es_garcia','fa_ansarian','fa_ayati','fa_gharaati','fa_ghomshei','fa_khorramshahi','fa_makarem','fa_moezzi','fa_mojtabavi','fa_sadeqi','fr_hamidullah','hi_farooq','hi_hindi','id_indonesian','id_jalalayn','id_muntakhab','it_piccardo','ja_japanese','ko_korean','ku_asan','ml_abdulhameed','ml_karakunnu','ms_basmeih','nl_keyzer','nl_leemhuis','nl_siregar','no_berg','ps_abdulwali','ro_grigore','ru_abuadel','ru_krachkovsky','ru_kuliev','ru_muntahab','ru_osmanov','ru_sablukov','sd_amroti','so_abduh','sq_mehdiu','sq_nahi','sv_bernstrom','sw_barwani','ta_tamil','tg_ayati','tr_ates','tr_bulac','tr_ozturk','tr_transliteration','tr_vakfi','tr_yazir','tr_yildirim','tt_nugman','ur_ahmedali','ur_jalandhry','ur_jawadi','ur_junagarhi','ur_maududi','ur_najafi','ur_qadri','uz_sodik'];
export const translateSelected = localStore('translate', 'fa_ghomshei', (
    localStorage.getItem('translate') === null ||
    !availableTranslates.includes(JSON.parse(localStorage.getItem('translate')))
));

export const showOnlyText = localStore('showtext', false, (
    localStorage.getItem('showtext') === null  ||
    ![true, false].includes(JSON.parse(localStorage.getItem('showtext')))
));

export const showOnlyTranslate = localStore('showtranslate', false, (
    localStorage.getItem('showtranslate') === null ||
    ![true, false].includes(JSON.parse(localStorage.getItem('showtranslate')))
));

export const darkTheme = localStore('darktheme', false, (
    localStorage.getItem('darktheme') === null     ||
    ![true, false].includes(JSON.parse(localStorage.getItem('darktheme')))
));

export const textFontSize = localStore('textsize', 30, (
    localStorage.getItem('textsize') === null      ||
    typeof JSON.parse(localStorage.getItem('textsize')) !== "number"
));

export const translateFontSize = localStore('translatesize', 22, (
    localStorage.getItem('translatesize') === null ||
    typeof JSON.parse(localStorage.getItem('translatesize')) !== "number"
));
