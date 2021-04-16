<script>
import { Sura, Sajda } from './quran-data';
import { suraNumber, juzNumber, hizbNumber, ayaNumberInQuran } from './store';
$: ayaNumberInSura = $ayaNumberInQuran - Sura[$suraNumber][0] + 1;
$: sajdaType = Sajda.map((array) => array[3]).indexOf($ayaNumberInQuran);
</script>

<div id="statusline">
    <span>juz: {$juzNumber + 1}</span>
    <span>hizb: {$hizbNumber + 1}</span>
    <span>sura: {Sura[$suraNumber][5]}({Sura[$suraNumber][4]})</span>
    <span>aya: {ayaNumberInSura}</span>
    {#if sajdaType !== -1}
        <span>sajda {Sajda[sajdaType][2]} ۩</span>
    {/if}
</div>

<style>
#statusline {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20px;
    overflow: hidden;
    font-size: 15px;
    display: flex;
    align-items: center;

    background: #212121; /*#374047;*/
    color: #AAA;
}
span {
    padding: 0 7px;
}
</style>
