/* eslint-disable @typescript-eslint/no-use-before-define */
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// -----
import { readFileSync, readdirSync } from "fs";
import * as path from "path";

// eslint-disable-next-line import/no-unresolved
import { QuranData, getPageNumber, getSuraNumber, getJuzNumber } from './quran-data'

class State {
  ayaNumberInQuran: number
  suraNumber: number
  ayaNumberInSura: number
  juzNumber: number
  pageNumber: number
  text: string
  translate: string

  constructor(ayaNumberInQuran: number, text?: string, translate?: string) {
    this.ayaNumberInQuran = ayaNumberInQuran
    this.suraNumber = getSuraNumber(ayaNumberInQuran)
    this.ayaNumberInSura = ayaNumberInQuran - QuranData.Sura[this.suraNumber][0] + 1
    this.juzNumber = getJuzNumber(ayaNumberInQuran)
    this.pageNumber = getPageNumber(ayaNumberInQuran)
    this.text = text ? text : localStorage.getItem('text')
    this.translate = translate ? translate : localStorage.getItem('translate')
  }
}

class DOMDisplay {
  suraSelector: SelectorSura
  ayaSelector: SelectorAya
  juzSelector: SelectorJuz
  pageSelector: SelectorPage
  textSelector: SelectorText
  translateSelector: SelectorTranslate
  contentDiv: Content
  nextButton: PaginationButton
  prevButton: PaginationButton

  constructor(state: State) {
    const browseSection: Element = document.querySelector('#browse')
    const textSection: HTMLDivElement = document.querySelector('#text')
    const translateSection: HTMLDivElement = document.querySelector('#translate')
    const mainSection: HTMLElement = document.querySelector('main')
    const paginationSection: HTMLDivElement = document.querySelector('#pagination')
    browseSection.innerHTML = ''
    textSection.innerHTML = ''
    translateSection.innerHTML = ''
    mainSection.innerHTML = ''
    paginationSection.innerHTML = ''

    this.suraSelector = new SelectorSura(state.suraNumber, (event: Event) => {
      const selector = event.target as HTMLSelectElement
      const suraNumber = Number(selector.value)
      const ayaNumberInQuran: number = QuranData.Sura[suraNumber][0]
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      this.reDraw()
    })
    this.ayaSelector = new SelectorAya(state.suraNumber, state.ayaNumberInSura, (event: Event) => {
      const selector = event.target as HTMLSelectElement
      const ayaNumberInQuran = Number(selector.value)
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      this.reDraw()
    })
    this.juzSelector = new SelectorJuz(state.juzNumber, (event: Event) => {
      const selector = event.target as HTMLSelectElement
      const ayaNumberInQuran = Number(selector.value)
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      this.reDraw()
    })
    this.pageSelector = new SelectorPage(state.pageNumber, (event: Event) => {
      const selector = event.target as HTMLSelectElement
      const ayaNumberInQuran: number = QuranData.Page[Number(selector.value)][2]
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      this.reDraw()
    })
    browseSection.appendChild(this.suraSelector.selector)
    browseSection.appendChild(this.ayaSelector.selector)
    browseSection.appendChild(this.juzSelector.selector)
    browseSection.appendChild(this.pageSelector.selector)

    this.textSelector = new SelectorText((event: Event) => {
      const selector = event.target as HTMLSelectElement
      localStorage.setItem('text', selector.value)
      this.reDraw()
    })
    textSection.appendChild(this.textSelector.selector)

    this.translateSelector = new SelectorTranslate((event: Event) => {
      const selector = event.target as HTMLSelectElement
      localStorage.setItem('translate', selector.value)
      this.reDraw()
    })
    translateSection.appendChild(this.translateSelector.selector)

    this.contentDiv = new Content(state.pageNumber, state.ayaNumberInQuran)
    mainSection.appendChild(this.contentDiv.dom)

    // ----- pagination next/prev buttons
    this.nextButton = new PaginationButton('next', state.pageNumber)
    this.nextButton.button.addEventListener('click', () => {
      localStorage.setItem('aya', QuranData.Page[state.pageNumber + 1][2].toString())
      this.reDraw()
    })
    this.nextButton.button.disabled = state.pageNumber > 603 ? true : false

    this.prevButton = new PaginationButton('prev', state.pageNumber)
    this.prevButton.button.addEventListener('click', () => {
      localStorage.setItem('aya', QuranData.Page[state.pageNumber - 1][2].toString())
      this.reDraw()
    })

    paginationSection.appendChild(this.nextButton.button)
    paginationSection.appendChild(this.prevButton.button)

    if (state.ayaNumberInSura === 1) {
      document.getElementById('sura' + state.suraNumber).scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('aya' + state.ayaNumberInQuran).scrollIntoView({ behavior: 'smooth' });
    }
  }
  reDraw(): void {
    const text: string = localStorage.getItem('text')
    const translate: string = localStorage.getItem('translate')
    const ayaNumberInQuran = Number(localStorage.getItem('aya'))
    new DOMDisplay(new State(ayaNumberInQuran, text, translate))
  }
}

class SelectorSura {
  selector: HTMLSelectElement
  ayaNumberInQuran: number
  constructor(suraNumber: number, listener: (event: Event) => void) {
    this.selector = document.createElement('select')
    this.selector.id = 'suraSelector'
    for (let index = 1; index < QuranData.Sura.length; index++) {
      const option: HTMLOptionElement = document.createElement('option')
      option.value = index.toString()
      option.innerText = index + '- ' + QuranData.Sura[index][5] + ' (' + QuranData.Sura[index][4] + ')'
      this.selector.appendChild(option)
    }
    this.selector.selectedIndex = suraNumber - 1
    this.selector.addEventListener('change', listener)
  }
}

class SelectorAya {
  selector: HTMLSelectElement
  constructor(suraNumber: number, ayaNumberInSura: number, listener: (event: Event) => void) {
    this.selector = document.createElement('select')
    this.selector.id = 'ayaSelector'
    const suraLength = QuranData.Sura[suraNumber][1]
    for (let index = 1; index <= suraLength; index++) {
      const option: HTMLOptionElement = document.createElement('option')
      option.value = (QuranData.Sura[suraNumber][0] + index - 1).toString() // ayaNumberInQuran
      option.innerText = 'aya ' + index
      this.selector.appendChild(option)
    }
    this.selector.selectedIndex = ayaNumberInSura - 1
    this.selector.addEventListener('change', listener)
  }
}

class SelectorJuz {
  selector: HTMLSelectElement
  constructor(juzNumber: number, listener: (event: Event) => void) {
    this.selector = document.createElement('select')
    this.selector.id = 'juzSelector'
    for (let index = 1; index <= 30; index++) {
      const option: HTMLOptionElement = document.createElement('option')
      option.value = (QuranData.Juz[index][2]).toString() // ayaNumberInQuran
      option.innerText = `juz ${index}`
      this.selector.appendChild(option)
    }
    this.selector.selectedIndex = juzNumber - 1
    this.selector.addEventListener('change', listener)
  }
}

class SelectorPage {
  selector: HTMLSelectElement
  constructor(pageNumber: number, listener: (event: Event) => void) {
    this.selector = document.createElement('select')
    this.selector.id = 'pageSelector'
    for (let index = 1; index <= 604; index++) {
      const option: HTMLOptionElement = document.createElement('option')
      option.value = index.toString() // ayaNumberInQuran
      option.innerText = `page ${index}`
      this.selector.appendChild(option)
    }
    this.selector.selectedIndex = pageNumber - 1
    this.selector.addEventListener('change', listener)
  }
}

class SelectorText {
  selector: HTMLSelectElement
  constructor(listener: (event: Event) => void) {
    this.selector = document.createElement('select')
    this.selector.id = 'textSelector'
    for (const file of readdirSync(path.join(__dirname, "../assets/quran"))) {
      const option: HTMLOptionElement = document.createElement('option')
      option.value = path.join(__dirname, "../assets/quran", file)
      option.innerText = file.replace(/\d+_(\w+)-?(\w+)?\.txt$/, '$1 $2')
      this.selector.appendChild(option)
    }
    this.selector.value = localStorage.getItem('text')
    this.selector.addEventListener('change', listener)
  }
}

class SelectorTranslate {
  selector: HTMLSelectElement
  constructor(listener: (event: Event) => void) {
    this.selector = document.createElement('select')
    this.selector.id = 'translateSelector'
    for (const file of readdirSync(path.join(__dirname, "../assets/translate"))) {
      const option: HTMLOptionElement = document.createElement('option')
      option.value = path.join(__dirname, "../assets/translate", file)
      //option.innerText = file.replace(/^(\w+)\.(\w+)$/, '$1 $2')
      const match = /(\w+)\.(\w+)/.exec(file)
      option.innerText = QuranData.transList[file] + ' (' + QuranData.langList[match[1]] + ')'
      this.selector.appendChild(option)
    }
    this.selector.value = localStorage.getItem('translate')
    this.selector.addEventListener('change', listener)
  }
}

class PaginationButton {
  button: HTMLButtonElement
  constructor(nav: string, page: number) {
    let id: string
    let text: string
    let value: string
    if (nav === 'prev') {
      id = 'prevButton'
      text = 'prev page'
      value = (page - 1).toString()
    }
    if (nav === 'next') {
      id = 'nextButton'
      text = 'next page'
      value = (page - 1).toString()
    }
    this.button = document.createElement('button')
    this.button.id = id
    this.button.className = 'btn--raised'
    this.button.innerText = text
    this.button.value = value
    this.button.disabled = page > 603 ? true : false
    this.button.disabled = page < 2 ? true : false
  }
}

class Content {
  dom: HTMLElement
  constructor(page: number, selectedAya: number) {
    if (page > 604) page = 604
    if (page < 1) page = 1
    const sajda: Array<number> = QuranData.Sajda.map(array => array[3])
    const Text: string[] = readFileSync(localStorage.getItem('text'), 'utf8').split('\n')
    const trText: string[] = readFileSync(localStorage.getItem('translate'), 'utf8').split('\n')
    const trName: string = path.basename(localStorage.getItem('translate'))
    const match = /(\w+)\.\w+/.exec(trName)
    const trDir = QuranData.rtlLangs.includes(match[1]) ? 'rtl' : 'ltr'

    this.dom = document.createElement('section')
    // ----- QuranData.Page[PageNumber] -> [Sura number, Aya Number In Sura(from1), Aya Number In Quran(from0)]
    for (let ayaNumberInQuran = QuranData.Page[page][2]; ayaNumberInQuran < QuranData.Page[page + 1][2]; ayaNumberInQuran++) {
      const suraNumber: number = getSuraNumber(ayaNumberInQuran)
      const ayaNumberInSura: number = ayaNumberInQuran - QuranData.Sura[suraNumber][0]
      let ayaText: string = Text[ayaNumberInQuran]

      // ----- if is Sura's first Aya
      if (ayaNumberInSura === 0) {
        const suraNumber: number = getSuraNumber(ayaNumberInQuran)
        const suraName: HTMLDivElement = document.createElement('div')
        suraName.id = 'sura' + suraNumber
        suraName.className = 'sura'
        suraName.innerText = QuranData.Sura[suraNumber][4]
        this.dom.appendChild(suraName)
      }
      // ----- in Sura(1) bismillah is a separate aya and in Sura(9) sura start without bismillah
      if (ayaNumberInSura === 0 && suraNumber !== 1 && suraNumber !== 9) {
        // ----- show bismillah in new line
        const bismillah: HTMLDivElement = document.createElement('div')
        bismillah.className = 'bismillah'
        bismillah.innerText += 'بِسمِ اللَّهِ الرَّحمنِ الرَّحيمِ'
        this.dom.appendChild(bismillah)
        // ----- and remove bismillah from start of first aya
        ayaText = ayaText.replace(/^(([^ ]+ ){4})/u, '')
      }

      // ----- crate new line(div) for each aya
      const ayaDiv: HTMLDivElement = document.createElement('div')
      ayaDiv.id = 'aya' + ayaNumberInQuran

      // ----- aya Text
      const ayaDivText: HTMLDivElement = document.createElement('div')
      ayaDivText.id = 'ayaText' + ayaNumberInQuran
      ayaDiv.className = 'aya'
      if (sajda.includes(ayaNumberInQuran)) {
        ayaDivText.className = 'ayatext sajda' // fade-in-from-right
      } else {
        ayaDivText.className = 'ayatext' // fade-in-from-right
      }
      ayaDivText.innerText = ayaText.trim()
      ayaDiv.appendChild(ayaDivText)

      // ----- aya Number
      const ayaSpan = document.createElement('span')
      ayaSpan.className = 'ayanum'
      ayaSpan.innerText = '(' + toFarsiNumber(ayaNumberInSura + 1) + ')'
      ayaDivText.appendChild(ayaSpan)

      // ----- create Translate
      const trDiv: HTMLDivElement = document.createElement('div')
      trDiv.className = 'translate ' + trDir + ' ' + match[1] // fade-in-from-right
      const trLine = trText[ayaNumberInQuran].split('|')
      trDiv.innerText = trLine[2]
      ayaDiv.appendChild(trDiv)

      if (selectedAya === ayaNumberInQuran) {
        ayaDiv.className += ' selected' // fade-in-from-right'
      }
      ayaDiv.addEventListener('click', () => {
        localStorage.setItem('aya', ayaNumberInQuran.toString())
        new DOMDisplay(new State(ayaNumberInQuran))
      })
      this.dom.appendChild(ayaDiv)
    }
  }
}

function toFarsiNumber(n: number): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/\d/g, (x: unknown) => farsiDigits[Number(x)]);
}


function load(): void {
  if (!localStorage.getItem('text')) {
    localStorage.setItem('text', path.join(__dirname, "../assets/quran/", '01_simple.txt'))
  }
  if (!localStorage.getItem('translate')) {
    localStorage.setItem('translate', path.join(__dirname, "../assets/translate/", 'fa.ghomshei'))
  }
  if (!localStorage.getItem('aya')) {
    localStorage.setItem('aya', '0')
  }
  const text: string = localStorage.getItem('text')
  const translate: string = localStorage.getItem('translate')
  const ayaNumberInQuran = Number(localStorage.getItem('aya'))

  new DOMDisplay(new State(ayaNumberInQuran, text, translate))
}

// ----- when content load
window.addEventListener("DOMContentLoaded", () => {
  load()
})

window.addEventListener(
  'keyup', event => {
    if (event.key === "ArrowRight") {
      const pageNumber = getPageNumber(Number(localStorage.getItem('aya')))
      const ayaNumberInQuran = QuranData.Page[pageNumber - 1][2]
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      new DOMDisplay(new State(ayaNumberInQuran))
    } else if (event.key === "ArrowLeft") {
      const pageNumber = getPageNumber(Number(localStorage.getItem('aya')))
      const ayaNumberInQuran = QuranData.Page[pageNumber + 1][2]
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      new DOMDisplay(new State(ayaNumberInQuran))
    } else if (event.key === "ArrowUp") {
      const ayaNumberInQuran = Number(localStorage.getItem('aya')) - 1
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      new DOMDisplay(new State(ayaNumberInQuran))
    } else if (event.key === "ArrowDown") {
      const ayaNumberInQuran = Number(localStorage.getItem('aya')) + 1
      localStorage.setItem('aya', ayaNumberInQuran.toString())
      new DOMDisplay(new State(ayaNumberInQuran))
    }
    //event.preventDefault()
  },
  false)