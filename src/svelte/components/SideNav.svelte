<script>
import { sideBarStatus } from '../store';

import TableOfContents32 from 'carbon-icons-svelte/lib/TableOfContents32';
import Settings32 from 'carbon-icons-svelte/lib/Settings32';
import Help32 from 'carbon-icons-svelte/lib/Help32';
import Information32 from 'carbon-icons-svelte/lib/Information32';

const toggle = (section) => {
    sideBarStatus.update((sideBarStatus) => {
        Object.keys(sideBarStatus).map((key) => {
            if (key === section) {
                sideBarStatus[key] = !sideBarStatus[key];
            } else {
                sideBarStatus[key] = false;
            }
        });
        sideBarStatus.active = sideBarStatus[section];
        return sideBarStatus;
    });
};
</script>

<div id="sidenav">
    <div class="top">
        <div class="icon" class:active={$sideBarStatus.informations} on:click={() => toggle('informations')}>
            <TableOfContents32 />
        </div>
        <div class="icon" class:active={$sideBarStatus.settings} on:click={() => toggle('settings')}>
            <Settings32 />
        </div>
    </div>
    
    <div class="bottom">
        <div class="icon" class:active={$sideBarStatus.help} on:click={() => toggle('help')}>
            <Help32 />
        </div>
        <div class="icon" class:active={$sideBarStatus.about} on:click={() => toggle('about')}>
            <Information32 />
        </div>
    </div>
</div>

<style>
#sidenav {
    position: fixed;
    top: 0;
    left: 0;
    width: 50px;
    height: calc(100% - 20px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    z-index: 99999999;

    background: #434957; /*#606e79;*/
    color: #9e9e9e; /*#bfc5c9;*/
}
.icon {
    padding: 10px 7px;
    cursor: pointer;
    transition: border 0.1s linear;
    /* transition: background 0.2s linear; */
    /* transition: color 0.2s linear; */
}
.bottom .icon { padding: 5px;}

#sidenav .active {
    border-left: 3px solid #eee;
    color: #FFF;
    background: #61afef;
}

</style>
