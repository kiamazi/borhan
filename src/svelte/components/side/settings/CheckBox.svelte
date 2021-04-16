<script>
    export let id = checkbox
    export let checked = false
    export let thisCheckBox
</script>

<div class="checkbox">
    <label for="{id}" id="{id}_label" class="text">
        <slot></slot>
    </label>
    <input type="checkbox" id="{id}" bind:checked={checked} bind:this={thisCheckBox} on:click>
</div>

<style>
    input {padding: 0;}
    .checkbox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: Sahel;
        padding: 0 5px;
    }
    .checkbox input {
        outline: none;
        height: 20px;
        width: 40px;
        border-radius: 50px;
        -webkit-appearance: none;
        position: relative;
        background: #e6e6e6;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        transition: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    .checkbox input:checked {
        background: #c2e4f0/*#f7f3dc;*/
    }
    .checkbox input:before {
        position: absolute;
        content: "";
        left: 0;
        height: 20px;
        width: 20px;
        background: rgb(149, 183, 247);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        border-radius: 50px;
        transform: scale(0.85);
        transition: left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    input:checked:before {
        left: 20px;
        background:steelblue;
    }
    .checkbox .text:before {
        content: "";
        font-size: 25px;
        font-weight: 500;
        color: #bfbfbf;
    }
    input:checked ~ .text:before {
        color: #664aff;
        font-size: 25px;
        content: "";
    }
</style>
