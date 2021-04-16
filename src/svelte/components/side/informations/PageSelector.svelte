<script>
import { afterUpdate } from 'svelte';
import { ayaNumberInQuran, pageNumber } from '../../../store';
import { Page } from '../../../quran-data';

let pageSelector;

afterUpdate(() => {
    pageSelector.selectedIndex = $pageNumber;
});
</script>

<select bind:value={$ayaNumberInQuran} bind:this={pageSelector}>
    {#each Array(604) as _, index}
        <option value={Page[index][2]}>{index + 1}</option>
    {/each}
</select>

<style>
    select {
        border: 0;
        border-radius: 0;
        padding: 2px;
        border-bottom: 1px solid;
    }
</style>
