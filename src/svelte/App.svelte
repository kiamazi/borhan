<script>
	import { pageNumber, ayaNumberInQuran } from "./store";
	import { Page } from "./quran-data";

	import SideNav from './components/SideNav.svelte'
	import SidePanel from './components/SidePanel.svelte'
	import Main from './components/main/Main.svelte'
	import Pagination from './components/main/Pagination.svelte'
	import StatusLine from './StatusLine.svelte'

	function keyShortcuts(event)  {
    	if (event.key === "ArrowRight") {
			event.preventDefault();
			if ($pageNumber === 0) return;
    		$ayaNumberInQuran = Page[$pageNumber - 1][2]
    	} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			if ($pageNumber === 603) return;
    		$ayaNumberInQuran = Page[$pageNumber + 1][2]
    	} else if (event.key === "ArrowUp") {
			event.preventDefault();
			if (Number($ayaNumberInQuran) === 0) return;
    		$ayaNumberInQuran = Number($ayaNumberInQuran) - 1
    	} else if (event.key === "ArrowDown") {
			event.preventDefault();
			if (Number($ayaNumberInQuran) === 6235) return;
    		$ayaNumberInQuran = Number($ayaNumberInQuran) + 1
    	}
	}
</script>

<svelte:body on:keydown={keyShortcuts}/>


<SideNav />
<SidePanel />

<Main />

<Pagination />

<StatusLine />


<sidepanel></sidepanel>
<sidenav></sidenav>
<topnav></topnav> <!-- or just --> <toppanel></toppanel>
<!-- <main></main> -->
<pager></pager>
<footer></footer> <!-- thin botoom status line -->

<style>
</style>