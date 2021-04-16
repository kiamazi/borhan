<script>
import SuraSelector from './informations/SuraSelector.svelte';
import AyaSelector from './informations/AyaSelector.svelte';
import JuzSelector from './informations/JuzSelector.svelte';
import PageSelector from './informations/PageSelector.svelte';
import { ayaNumberInQuran, pageNumber, juzNumber, hizbNumber, suraNumber } from '../../store';
import * as QuranData from '../../quran-data';

let juzTotalPages;
let currentJuzPage;
let sajda;

$: {
    juzTotalPages =
        QuranData.getPageNumber(QuranData.Juz[$juzNumber + 1][2]) -
        QuranData.getPageNumber(QuranData.Juz[$juzNumber][2]);
    currentJuzPage = $pageNumber - QuranData.getPageNumber(QuranData.Juz[$juzNumber][2]) + 1;
    sajda = QuranData.Sajda.map((array) => array[3]).indexOf(Number($ayaNumberInQuran));
}
</script>

<SuraSelector />
<AyaSelector />

<div class="content">
    {QuranData.Sura[$suraNumber][4]}
    <br />
    {QuranData.Sura[$suraNumber][5]}
    <br />
    {QuranData.Sura[$suraNumber][6]}
</div>


<div class="content">
    Place of Revelation:
    <br />
    <span>
        {QuranData.Sura[$suraNumber][7]}
        {QuranData.Sura[$suraNumber][7] === 'Medinan' ? 'مدنی' : 'مکی'}
    </span>
</div>

<div class="content">
    Verses: {QuranData.Sura[$suraNumber][1]}
</div>

<div class="content">
    order: {QuranData.Sura[$suraNumber][3]}
</div>

<hr />

{#if sajda !== -1}
    <div>
        <span class="content"> ۩ Sajda </span>
        ({QuranData.Sajda[sajda][2]})
    </div>
{/if}

<div class="content">
    aya number in Quran:
    {$ayaNumberInQuran + 1}
</div>

<hr />

<JuzSelector />
<div class="content">
    (page {currentJuzPage} of {juzTotalPages})
</div>

<div class="content">
    hizb:
    {$hizbNumber + 1}
</div>

<!-- <div class="content">
    page:
    <PageSelector />
</div> -->

<style>
div { font-family: Sahel; }
.content {
    font-size: 14px;
    padding-top: 5px;
    padding-bottom: 5px;
}
</style>