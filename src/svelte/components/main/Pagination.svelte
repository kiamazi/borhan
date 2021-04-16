<script>
import PageSelector from '../side/informations/PageSelector.svelte';
import { ayaNumberInQuran, pageNumber, sideBarStatus } from '../../store';
import { Sajda, Page } from '../../quran-data';

let sajda; // number;
$: {
    sajda = Sajda.map((array) => array[3]).indexOf(Number($ayaNumberInQuran));
}

let prevButton; // HTMLButtonElement;
let nextButton; // HTMLButtonElement;
</script>

<section id="pagination" class:sideactive={$sideBarStatus.active}>
    <div class="prev-next">
        {#if $pageNumber < 603}
            <button
                bind:this={nextButton}
                value={$pageNumber + 1}
                on:click={() => ($ayaNumberInQuran = Page[$pageNumber + 1][2])}
            >
                next page <b class="btn">&laquo;</b>
            </button>
        {/if}
    </div>

    <div class="prev-next">
        {#if $pageNumber > 0}
            <button
                bind:this={prevButton}
                value={$pageNumber - 1}
                on:click={() => ($ayaNumberInQuran = Page[$pageNumber - 1][2])}
            >
                <b class="btn">&raquo;</b> prev page
            </button>
        {/if}
    </div>

    <div class="selector">
        page <PageSelector />
    </div>
</section>

<style>
section {
    position: fixed;
    bottom: 20px;
    right: 0;
    padding-right: 35px;
    padding-left: 35px;
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    width: calc(100% - 50px);
    height: 47px;
    transition: width 0.2s linear;

    font-size: 15px;

    /* box-shadow: 0 -1px 10px; */
    color:#555;
}
.sideactive {
    width: calc(100% - 305px);
}

.prev-next {
    padding-right: 20px;
}
button {
    background-color: inherit;
    color: dodgerblue;
    font-size: 13px;
    padding: 0;
    height: 47px;
    border: 0;
}
.btn {
    border: 2px solid black;
    font-size: 16px;
    cursor: pointer;
    border-color: #2196f3;
    border-radius: 50%;
    padding: 10px 15px;
}
button:hover .btn,
.btn:hover {
    background-color: #2196f3;
    color: white;
}

</style>
