<script>
import { translateSelected } from '../../../store';
import { translatesList, languagesList } from '../../../quran-data';
const translates = [
    'am_sadiq',
    'ar_jalalayn',
    'ar_muyassar',
    'az_mammadaliyev',
    'az_musayev',
    'ber_mensur',
    'bg_theophanov',
    'bn_bengali',
    'bn_hoque',
    'bs_mlivo',
    'de_aburida',
    'de_zaidan',
    'dv_divehi',
    'en_ahmedali',
    'en_ahmedraza',
    'en_arberry',
    'en_daryabadi',
    'en_itani',
    'en_maududi',
    'en_pickthall',
    'en_qarai',
    'en_qaribullah',
    'en_sahih',
    'en_sarwar',
    'en_transliteration',
    'en_wahiduddin',
    'en_yusufali',
    'es_bornez',
    'es_cortes',
    'es_garcia',
    'fa_ansarian',
    'fa_ayati',
    'fa_gharaati',
    'fa_ghomshei',
    'fa_khorramshahi',
    'fa_makarem',
    'fa_moezzi',
    'fa_mojtabavi',
    'fa_sadeqi',
    'fr_hamidullah',
    'hi_farooq',
    'hi_hindi',
    'id_indonesian',
    'id_jalalayn',
    'id_muntakhab',
    'it_piccardo',
    'ja_japanese',
    'ko_korean',
    'ku_asan',
    'ml_abdulhameed',
    'ml_karakunnu',
    'ms_basmeih',
    'nl_keyzer',
    'nl_leemhuis',
    'nl_siregar',
    'no_berg',
    'ps_abdulwali',
    'ro_grigore',
    'ru_abuadel',
    'ru_krachkovsky',
    'ru_kuliev',
    'ru_muntahab',
    'ru_osmanov',
    'ru_sablukov',
    'sd_amroti',
    'so_abduh',
    'sq_mehdiu',
    'sq_nahi',
    'sv_bernstrom',
    'sw_barwani',
    'ta_tamil',
    'tg_ayati',
    'tr_ates',
    'tr_bulac',
    'tr_ozturk',
    'tr_transliteration',
    'tr_vakfi',
    'tr_yazir',
    'tr_yildirim',
    'tt_nugman',
    'ur_ahmedali',
    'ur_jalandhry',
    'ur_jawadi',
    'ur_junagarhi',
    'ur_maududi',
    'ur_najafi',
    'ur_qadri',
    'uz_sodik',
];
let match;
</script>

<div>
    <!-- <span>translate</span> -->
    <select bind:value={$translateSelected}>
        <!-- {#each ipcRenderer.sendSync("readDir", "translate") as file} -->
        {#each translates as file}
            {(match = /(\w+)_(\w+)/.exec(file))}
            <option value={file}>
                {translatesList[file]} ({languagesList[match[1]]})
            </option>
        {/each}
    </select>
</div>

<style>
select {
    width: 100%;
    border: 0;
    border-bottom: 1px solid #777;
    background: #434957;
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>
