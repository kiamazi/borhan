<script>
import { sideBarStatus } from '../store';
import Informations from './side/Informations.svelte';
import Settings from './side/settings.svelte';
</script>

<div id="informations" class={$sideBarStatus.informations ? 'show' : 'hide'}>
    <Informations />
</div>

<div id="settings" class={$sideBarStatus.settings ? 'show' : 'hide'}>
    <Settings />
</div>

<div id="help" class={$sideBarStatus.help ? 'show' : 'hide'}>
    <h1>Signs</h1>
    <div class="help_content">
    <table>
        <tr>
            <td>۞</td>
            <td>Juz/Hizb start</td>
        </tr>
        <tr>
            <td>۩</td>
            <td>Sajda</td>
        </tr>
    </table>
    </div>
    <br />
    <h1>keyboard shourtcuts</h1>
    <div class="help_content">
        <table>
            <tr>
                <td>left</td>
                <td>next page</td>
            </tr>
            <tr>
                <td>right</td>
                <td>previous page</td>
            </tr>
            <tr>
                <td>up</td>
                <td>previous aya</td>
            </tr>
            <tr>
                <td>down</td>
                <td>next aya</td>
            </tr>
            <tr>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td>F11</td>
                <td>Full Screen</td>
            </tr>
            <tr>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td>Ctrl(Cmd)+R</td>
                <td>Reload</td>
            </tr>
            <tr>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td>Ctrl(Cmd)+Q</td>
                <td>Quit</td>
            </tr>
        </table>
    </div>
</div>

<div id="about" class={$sideBarStatus.about ? 'show' : 'hide'}>
    <div class="logo">
        <img src="./assets/images/borhan.png" alt="logo" />
        <h1>Borhan</h1>
    </div>
    <div class="rtl_top">مرا روزی مباد آن دم که بی یاد تو بنشینم</div>

    <p>Developed with love by <a href="https://kiavash.one">kiavash</a></p>
    <br />
    <p>text and translates: <a href="tanzil.ir">Tanzil</a></p>
    <p>Tanzil is an international Quranic project aimed at providing a highly-verified precise Quran text</p>
    <br />
    <p>
        fonts used in the app:
        <br />
        <a href="https://github.com/font-store/NoonFont">Noon</a>: Saleh Souzanchi
        <br />
        <a href="https://github.com/rastikerdar/vazir-font/">Vazir</a>: Saber Rastikerdar
        <br />
        <a href="https://github.com/rastikerdar/sahel-font/">Sahel</a>: Saber Rastikerdar
    </p>
    <br />
    <p>If you find a bug in the program or if you feel the need for new features in the program, feel free to add new issue in <a href="https://github.com/kiamazi/borhan/issues">github repository</a></p>
</div>

<style>
#settings,
#informations,
#help,
#about {
    position: fixed;
    top: 0;
    width: 260px;
    height: calc(100% - 20px);
    overflow-y: auto;
    padding: 10px 10px 10px 20px;
    transition: transform 0.2s linear;
    z-index: 1;

    color: #ccc;
    background: #434957;
}
.show {
    left: 47px;
}
.hide {
    transform: translateX(-287px);
}

.logo {
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
}
.logo img {
    width: 140px;
}
.logo h1 , #help h1 {
    font-size: 24px;
}
.rtl_top {
    text-align: right;
    direction: rtl;
    font-family: Sahel;
    font-size: 15px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
    margin-bottom: 20px;
}
.help_content {
    border-top: 1px solid #ccc;
    padding-top: 15px;
    margin-top: 10px;
}
table { width: 100%; }
</style>
