<script>
import { afterUpdate } from 'svelte';
import { ayaNumberInQuran, suraNumber } from '../../../store';
import { Sura } from '../../../quran-data';

let ayaSelector;
afterUpdate(() => {
    ayaSelector.value = $ayaNumberInQuran.toString();
});
</script>

<select bind:value={$ayaNumberInQuran} bind:this={ayaSelector}>
    {#each Array(Sura[$suraNumber][1]) as _, index}
        <option value={Sura[$suraNumber][0] + index}>
            aya {index + 1}
        </option>
    {/each}
</select>
