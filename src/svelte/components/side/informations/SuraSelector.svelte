<script>
import { afterUpdate } from 'svelte';
import { ayaNumberInQuran, suraNumber } from '../../../store';
import { Sura } from '../../../quran-data';

let suraSelector;
afterUpdate(() => {
    suraSelector.selectedIndex = $suraNumber;
});
</script>

<select bind:value={$ayaNumberInQuran} bind:this={suraSelector}>
    {#each Sura as sura, index}
        <option value={sura[0]}>{index + 1}- {sura[5]} ({sura[4]})</option>
    {/each}
</select>
