<script>
import { afterUpdate } from 'svelte';
import { ayaNumberInQuran, juzNumber } from '../../../store';
import { Juz } from '../../../quran-data';

let juzSelector;
afterUpdate(() => {
    juzSelector.selectedIndex = $juzNumber;
});
</script>

<select bind:value={$ayaNumberInQuran} bind:this={juzSelector}>
    {#each Array(30) as _, index}
        <option value={Juz[index][2]}>juz {index + 1}</option>
    {/each}
</select>
