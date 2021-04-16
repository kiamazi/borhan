<script>
import { textSelected } from '../../../store';

const texts = [
{ name: 'Simple', module: 'quran-simple'},
{ name: 'Simple Plain', module: 'quran-simple-plain'},
{ name: 'Simple Minimal', module: 'quran-simple-min'},
{ name: 'Simple Clean', module: 'quran-simple-clean'},
{ name: 'Uthmani', module: 'quran-uthmani'},
{ name: 'Uthmani Minimal', module: 'quran-uthmani-min'}
];

const description = {
    'quran-simple': 'Quran text in Imlaaei script.',
    'quran-simple-plain': 'Simple text without special demonstration of Ikhfas and Idghams.',
    'quran-simple-min': 'Simple text with minimal number of diacritics and symbols.',
    'quran-simple-clean': 'Simple text with no diacritics or symbols.',
    'quran-uthmani': 'Uthmani text, according to Medina Mushaf.',
    'quran-uthmani-min': 'Uthmani text with minimal number of diacritics and symbols.'
};
</script>

<div>
    <!-- <span>text</span> -->
    <select bind:value={$textSelected}>
        <!-- {#each ipcRenderer.sendSync('readDir', 'text') as file} -->
        {#each texts as {name,module}}
            <option value={module}>
                <!-- {String(file).replace(/\d+_(\w+)-?(\w+)?\.txt$/, '$1 $2')} -->
                {name}
            </option>
        {/each}
    </select>
</div>

<div class="content">
    {description[$textSelected]}
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
.content {
    font-size: 14px;
    padding-top: 10px;
    padding-bottom: 5px;
}
</style>
