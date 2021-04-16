<script>
import {
    ayaNumberInQuran,
    suraNumber,
    pageNumber,
    textSelected,
    translateSelected,
    showOnlyText,
    showOnlyTranslate,
    textFontSize,
    translateFontSize,
    sideBarStatus,
} from '../../store';
import { Sura } from '../../quran-data';
import { contentController } from './contentController';
import { afterUpdate } from 'svelte';

$: {
    document.documentElement.style.setProperty('--text-size', $textFontSize + 'px');
    document.documentElement.style.setProperty('--text-line-height', $textFontSize * 1.8 + 'px');
    document.documentElement.style.setProperty('--translate-size', $translateFontSize + 'px');
    document.documentElement.style.setProperty('--translate-line-height', $translateFontSize * 2 + 'px');
}
$: textContent = contentController($textSelected, $translateSelected, $pageNumber, $ayaNumberInQuran);

afterUpdate(async () => {
    const ayaNumberInSura = Number($ayaNumberInQuran) - Sura[$suraNumber][0] + 1;
    if (ayaNumberInSura === 1) {
        document.getElementById('sura' + $suraNumber).scrollIntoView({ behavior: 'smooth' });
    } else {
        document.getElementById('aya' + $ayaNumberInQuran).scrollIntoView({ behavior: 'smooth' });
    }
});

function toFarsiNumber(n) {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, (x) => farsiDigits[Number(x)]);
}
</script>

<main class:sideactive={$sideBarStatus.active}>
    {#each textContent as { ayaNumInQuran, suraNum, ayaNumInSura, text, translate, rtl, selected }, line}
        {#if ayaNumInSura === 1}
            <div id="sura{suraNum}" class="sura_name">
                {Sura[suraNum][4]}
            </div>
            {#if suraNum !== 0 && suraNum !== 8}
                <div class="bismillah">بِسمِ اللَّهِ الرَّحمنِ الرَّحيمِ</div>
            {/if}
        {/if}
        <section>
            <div
                id="aya{ayaNumInQuran}"
                class="aya"
                class:selected
                on:click={() => ($ayaNumberInQuran = ayaNumInQuran)}
            >
                {#if $showOnlyText === true || $showOnlyText === $showOnlyTranslate}
                    <div class="aya_text">
                        {text}<span class="aya_number">({toFarsiNumber(ayaNumInSura)})</span>
                    </div>
                {/if}
                {#if $showOnlyTranslate === true || $showOnlyText === $showOnlyTranslate}
                    <div class="aya_translate {rtl ? 'rtl' : 'ltr'}">
                        {translate}
                    </div>
                {/if}
            </div>
        </section>
    {/each}
</main>

<style>
main {
    position: fixed;
    top: 0;
    bottom: 70px;
    right: 0;
    height: calc(100% - 70px);
    width: calc(100% - 50px);
    overflow-y: scroll;
    text-align: center;
    transition: width 0.1s linear;
}
.sideactive {
    width: calc(100% - 305px);
}
.sura_name,
.bismillah,
.aya_text {
    font-family: Noon;
}
.sura_name {
    direction: rtl;
    text-align: center;
    font-size: 28pt;
    height: 100px;
    line-height: 100px;
    margin: 20px 0;
    background-image: url('../assets/images/sr.png');
    background-repeat: no-repeat;
    background-position-x: center;
}
.bismillah {
    direction: rtl;
    text-align: center;
    font-size: 20pt;
    line-height: 3rem;
    margin: 20px 0;
}
section {
    margin: 0 auto;
    padding: 5px;
    width: 90%;
    /* background-color: #FFF; */
}
.aya {
    border-bottom: 1px solid #888;
    cursor: pointer;
    line-height: 3rem;
    padding-bottom: 5px;
}
.aya_text {
    /* font-size: 28px; */
    font-size: var(--text-size);
    line-height: var(--text-line-height);
    padding-top: 5px;
    padding-right: 30px;
    padding-left: 30px;
    direction: rtl;
    text-align: right;
}
.aya_number {
    font-size: 20pt;
    padding: 0 5px;
}
.aya_translate {
    font-family: Vazir;
    /* font-size: 14pt; */
    font-size: var(--translate-size);
    line-height: var(--translate-line-height);
    padding-right: 30px;
    padding-left: 30px;
}
.rtl {
    direction: rtl;
    text-align: right;
    line-height: 2.5rem;
}
.ltr {
    font-family: Sahel;
    direction: ltr;
    text-align: left;
    line-height: 1.8rem;
}
.selected {
    /* background-color: #f0f0f0; */
    border-bottom: 5px double #333;
}
/* .selected::before {
        content: "\025c0";
        font-size: 14px;
        font-weight: 900;
        padding-top: 5px;
        width: 20px;
        float: right;
    } */
</style>
