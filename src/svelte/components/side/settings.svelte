<script>
    import TranslateSelector from "./settings/TranslateSelector.svelte";
    import TextSelector from "./settings/TextSelector.svelte";
    import CheckBox from "./settings/CheckBox.svelte"
    import { afterUpdate } from "svelte";
    import {
        showOnlyText,
        showOnlyTranslate,
        darkTheme,
        textFontSize,
        translateFontSize,
    } from "../../store";
    import TextScale16 from 'carbon-icons-svelte/lib/TextScale16';
    import TextAlignLeft32 from 'carbon-icons-svelte/lib/TextAlignLeft32';
    import Translate32 from 'carbon-icons-svelte/lib/Translate32';
    import TextHighlight32 from 'carbon-icons-svelte/lib/TextHighlight32';

    let styleCheck
    let styleCheckBox
    styleCheck = $darkTheme

    let textCheckBox
    let translateCheckBox

    $: $darkTheme = styleCheck

    afterUpdate(() => {
        textCheckBox.checked = $showOnlyText
        translateCheckBox.checked =
            $showOnlyTranslate
    });

    function checkBoxControll(event) {
        let that =
            event.target === textCheckBox ? translateCheckBox : textCheckBox;
        if (textCheckBox.checked && translateCheckBox.checked) {
            that.checked = false;
        }
        $showOnlyText = textCheckBox.checked
        $showOnlyTranslate =
            translateCheckBox.checked
    }
</script>

<svelte:head>
    {#if styleCheck}
        <link rel="stylesheet" href="dark.css" />
    {/if}
</svelte:head>

<div class="setting">
    <CheckBox
        id="changestyle"
        bind:checked={styleCheck}
        bind:thisCheckBox={styleCheckBox}
    >
    <div class="title">
        <TextHighlight32 />
        <span>Dark Theme</span>
    </div>
    </CheckBox>

    <hr />

    <div class="title">
        <TextAlignLeft32 />
        <span>Quran Text</span>
    </div>
    <TextSelector />
    <CheckBox
        id="only_text_show"
        bind:thisCheckBox={textCheckBox}
        on:click={checkBoxControll}
    >
        show only text
    </CheckBox>
    <div class="size_select">
        <div>
            <TextScale16 />
            font size:
            {$textFontSize}
        </div>
        <div>
            <button class="size" on:click={() => $textFontSize++}>+</button>
            <button class="size" on:click={() => $textFontSize--}>-</button>
            <button class="size" on:click={() => ($textFontSize = 30)}>reset</button>
        </div>
    </div>

    <hr />

    <div class="title">
        <Translate32 />
        <span>Quran Translate</span>
    </div>
    <TranslateSelector />
    <CheckBox
        id="only_translate_show"
        bind:thisCheckBox={translateCheckBox}
        on:click={checkBoxControll}
    >
        show only translate
    </CheckBox>
    <div class="size_select">
        <div>
            <TextScale16 />
            font size:
            {$translateFontSize}
        </div>
        <div>
            <button class="size" on:click={() => $translateFontSize++}>+</button>
            <button class="size" on:click={() => $translateFontSize--}>-</button>
            <button class="size" on:click={() => ($translateFontSize = 22)}>reset</button>
        </div>
    </div>
</div>

<style>
.setting { padding-top: 10px; }
div { font-family: Sahel; }
hr { margin-top: 15px; }
.title {
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-bottom: 5px;
}
.size_select {
    display: flex;
    justify-content: space-between;
    padding: 5px;
}
</style>