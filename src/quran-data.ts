
// usage:
// import { QuranData } from './quran-data'

type Sura   = [number, number, number, number, string, string, string, string]
type Juz    = [number, number, number]
type Hizb   = [number, number, number]
type Manzil = [number, number]
type Ruku   = [number, number]
type Page   = [number, number, number]
type Sajda  = [number, number, string, number]
//type Octed   = Array<[]|[number,number,number,number,string,string,string,string]>
//type Duplex  = Array<[]|[number,number]>
//type Triplex = Array<[]|[number,number,string]>
interface QuranData {
	Sura: Array<Sura>
	Juz : Array<Juz>
	Hizb: Array<Hizb>
	Manzil: Array<Manzil>
	Ruku: Array<Ruku>
	Page: Array<Page>
	Sajda: Array<Sajda>
	totalAyasNumber: number
    totalSurasNumber: number
    totalPagesNumber: number
    totalJuzsNumber: number
	transList: { [key: string]: string }
	langList: { [key: string]: string }
	rtlLangs: Array<string>
}

const QuranData: QuranData = {

	//------------------ Sura Data ---------------------
	Sura : [
		// [start, ayas, order, rukus, name, tname, ename, type]
		[0,0,0,0,'','','',''],
		[0, 7, 5, 1, 'الفاتحة', "Al-Faatiha", 'The Opening', 'Meccan'],
		[7, 286, 87, 40, 'البقرة', "Al-Baqara", 'The Cow', 'Medinan'],
		[293, 200, 89, 20, 'آل عمران', "Aal-i-Imraan", 'The Family of Imraan', 'Medinan'],
		[493, 176, 92, 24, 'النساء', "An-Nisaa", 'The Women', 'Medinan'],
		[669, 120, 112, 16, 'المائدة', "Al-Maaida", 'The Table', 'Medinan'],
		[789, 165, 55, 20, 'الأنعام', "Al-An'aam", 'The Cattle', 'Meccan'],
		[954, 206, 39, 24, 'الأعراف', "Al-A'raaf", 'The Heights', 'Meccan'],
		[1160, 75, 88, 10, 'الأنفال', "Al-Anfaal", 'The Spoils of War', 'Medinan'],
		[1235, 129, 113, 16, 'التوبة', "At-Tawba", 'The Repentance', 'Medinan'],
		[1364, 109, 51, 11, 'يونس', "Yunus", 'Jonas', 'Meccan'],
		[1473, 123, 52, 10, 'هود', "Hud", 'Hud', 'Meccan'],
		[1596, 111, 53, 12, 'يوسف', "Yusuf", 'Joseph', 'Meccan'],
		[1707, 43, 96, 6, 'الرعد', "Ar-Ra'd", 'The Thunder', 'Medinan'],
		[1750, 52, 72, 7, 'ابراهيم', "Ibrahim", 'Abraham', 'Meccan'],
		[1802, 99, 54, 6, 'الحجر', "Al-Hijr", 'The Rock', 'Meccan'],
		[1901, 128, 70, 16, 'النحل', "An-Nahl", 'The Bee', 'Meccan'],
		[2029, 111, 50, 12, 'الإسراء', "Al-Israa", 'The Night Journey', 'Meccan'],
		[2140, 110, 69, 12, 'الكهف', "Al-Kahf", 'The Cave', 'Meccan'],
		[2250, 98, 44, 6, 'مريم', "Maryam", 'Mary', 'Meccan'],
		[2348, 135, 45, 8, 'طه', "Taa-Haa", 'Taa-Haa', 'Meccan'],
		[2483, 112, 73, 7, 'الأنبياء', "Al-Anbiyaa", 'The Prophets', 'Meccan'],
		[2595, 78, 103, 10, 'الحج', "Al-Hajj", 'The Pilgrimage', 'Medinan'],
		[2673, 118, 74, 6, 'المؤمنون', "Al-Muminoon", 'The Believers', 'Meccan'],
		[2791, 64, 102, 9, 'النور', "An-Noor", 'The Light', 'Medinan'],
		[2855, 77, 42, 6, 'الفرقان', "Al-Furqaan", 'The Criterion', 'Meccan'],
		[2932, 227, 47, 11, 'الشعراء', "Ash-Shu'araa", 'The Poets', 'Meccan'],
		[3159, 93, 48, 7, 'النمل', "An-Naml", 'The Ant', 'Meccan'],
		[3252, 88, 49, 8, 'القصص', "Al-Qasas", 'The Stories', 'Meccan'],
		[3340, 69, 85, 7, 'العنكبوت', "Al-Ankaboot", 'The Spider', 'Meccan'],
		[3409, 60, 84, 6, 'الروم', "Ar-Room", 'The Romans', 'Meccan'],
		[3469, 34, 57, 3, 'لقمان', "Luqman", 'Luqman', 'Meccan'],
		[3503, 30, 75, 3, 'السجدة', "As-Sajda", 'The Prostration', 'Meccan'],
		[3533, 73, 90, 9, 'الأحزاب', "Al-Ahzaab", 'The Clans', 'Medinan'],
		[3606, 54, 58, 6, 'سبإ', "Saba", 'Sheba', 'Meccan'],
		[3660, 45, 43, 5, 'فاطر', "Faatir", 'The Originator', 'Meccan'],
		[3705, 83, 41, 5, 'يس', "Yaseen", 'Yaseen', 'Meccan'],
		[3788, 182, 56, 5, 'الصافات', "As-Saaffaat", 'Those drawn up in Ranks', 'Meccan'],
		[3970, 88, 38, 5, 'ص', "Saad", 'The letter Saad', 'Meccan'],
		[4058, 75, 59, 8, 'الزمر', "Az-Zumar", 'The Groups', 'Meccan'],
		[4133, 85, 60, 9, 'غافر', "Al-Ghaafir", 'The Forgiver', 'Meccan'],
		[4218, 54, 61, 6, 'فصلت', "Fussilat", 'Explained in detail', 'Meccan'],
		[4272, 53, 62, 5, 'الشورى', "Ash-Shura", 'Consultation', 'Meccan'],
		[4325, 89, 63, 7, 'الزخرف', "Az-Zukhruf", 'Ornaments of gold', 'Meccan'],
		[4414, 59, 64, 3, 'الدخان', "Ad-Dukhaan", 'The Smoke', 'Meccan'],
		[4473, 37, 65, 4, 'الجاثية', "Al-Jaathiya", 'Crouching', 'Meccan'],
		[4510, 35, 66, 4, 'الأحقاف', "Al-Ahqaf", 'The Dunes', 'Meccan'],
		[4545, 38, 95, 4, 'محمد', "Muhammad", 'Muhammad', 'Medinan'],
		[4583, 29, 111, 4, 'الفتح', "Al-Fath", 'The Victory', 'Medinan'],
		[4612, 18, 106, 2, 'الحجرات', "Al-Hujuraat", 'The Inner Apartments', 'Medinan'],
		[4630, 45, 34, 3, 'ق', "Qaaf", 'The letter Qaaf', 'Meccan'],
		[4675, 60, 67, 3, 'الذاريات', "Adh-Dhaariyat", 'The Winnowing Winds', 'Meccan'],
		[4735, 49, 76, 2, 'الطور', "At-Tur", 'The Mount', 'Meccan'],
		[4784, 62, 23, 3, 'النجم', "An-Najm", 'The Star', 'Meccan'],
		[4846, 55, 37, 3, 'القمر', "Al-Qamar", 'The Moon', 'Meccan'],
		[4901, 78, 97, 3, 'الرحمن', "Ar-Rahmaan", 'The Beneficent', 'Medinan'],
		[4979, 96, 46, 3, 'الواقعة', "Al-Waaqia", 'The Inevitable', 'Meccan'],
		[5075, 29, 94, 4, 'الحديد', "Al-Hadid", 'The Iron', 'Medinan'],
		[5104, 22, 105, 3, 'المجادلة', "Al-Mujaadila", 'The Pleading Woman', 'Medinan'],
		[5126, 24, 101, 3, 'الحشر', "Al-Hashr", 'The Exile', 'Medinan'],
		[5150, 13, 91, 2, 'الممتحنة', "Al-Mumtahana", 'She that is to be examined', 'Medinan'],
		[5163, 14, 109, 2, 'الصف', "As-Saff", 'The Ranks', 'Medinan'],
		[5177, 11, 110, 2, 'الجمعة', "Al-Jumu'a", 'Friday', 'Medinan'],
		[5188, 11, 104, 2, 'المنافقون', "Al-Munaafiqoon", 'The Hypocrites', 'Medinan'],
		[5199, 18, 108, 2, 'التغابن', "At-Taghaabun", 'Mutual Disillusion', 'Medinan'],
		[5217, 12, 99, 2, 'الطلاق', "At-Talaaq", 'Divorce', 'Medinan'],
		[5229, 12, 107, 2, 'التحريم', "At-Tahrim", 'The Prohibition', 'Medinan'],
		[5241, 30, 77, 2, 'الملك', "Al-Mulk", 'The Sovereignty', 'Meccan'],
		[5271, 52, 2, 2, 'القلم', "Al-Qalam", 'The Pen', 'Meccan'],
		[5323, 52, 78, 2, 'الحاقة', "Al-Haaqqa", 'The Reality', 'Meccan'],
		[5375, 44, 79, 2, 'المعارج', "Al-Ma'aarij", 'The Ascending Stairways', 'Meccan'],
		[5419, 28, 71, 2, 'نوح', "Nooh", 'Noah', 'Meccan'],
		[5447, 28, 40, 2, 'الجن', "Al-Jinn", 'The Jinn', 'Meccan'],
		[5475, 20, 3, 2, 'المزمل', "Al-Muzzammil", 'The Enshrouded One', 'Meccan'],
		[5495, 56, 4, 2, 'المدثر', "Al-Muddaththir", 'The Cloaked One', 'Meccan'],
		[5551, 40, 31, 2, 'القيامة', "Al-Qiyaama", 'The Resurrection', 'Meccan'],
		[5591, 31, 98, 2, 'الانسان', "Al-Insaan", 'Man', 'Medinan'],
		[5622, 50, 33, 2, 'المرسلات', "Al-Mursalaat", 'The Emissaries', 'Meccan'],
		[5672, 40, 80, 2, 'النبإ', "An-Naba", 'The Announcement', 'Meccan'],
		[5712, 46, 81, 2, 'النازعات', "An-Naazi'aat", 'Those who drag forth', 'Meccan'],
		[5758, 42, 24, 1, 'عبس', "Abasa", 'He frowned', 'Meccan'],
		[5800, 29, 7, 1, 'التكوير', "At-Takwir", 'The Overthrowing', 'Meccan'],
		[5829, 19, 82, 1, 'الإنفطار', "Al-Infitaar", 'The Cleaving', 'Meccan'],
		[5848, 36, 86, 1, 'المطففين', "Al-Mutaffifin", 'Defrauding', 'Meccan'],
		[5884, 25, 83, 1, 'الإنشقاق', "Al-Inshiqaaq", 'The Splitting Open', 'Meccan'],
		[5909, 22, 27, 1, 'البروج', "Al-Burooj", 'The Constellations', 'Meccan'],
		[5931, 17, 36, 1, 'الطارق', "At-Taariq", 'The Morning Star', 'Meccan'],
		[5948, 19, 8, 1, 'الأعلى', "Al-A'laa", 'The Most High', 'Meccan'],
		[5967, 26, 68, 1, 'الغاشية', "Al-Ghaashiya", 'The Overwhelming', 'Meccan'],
		[5993, 30, 10, 1, 'الفجر', "Al-Fajr", 'The Dawn', 'Meccan'],
		[6023, 20, 35, 1, 'البلد', "Al-Balad", 'The City', 'Meccan'],
		[6043, 15, 26, 1, 'الشمس', "Ash-Shams", 'The Sun', 'Meccan'],
		[6058, 21, 9, 1, 'الليل', "Al-Lail", 'The Night', 'Meccan'],
		[6079, 11, 11, 1, 'الضحى', "Ad-Dhuhaa", 'The Morning Hours', 'Meccan'],
		[6090, 8, 12, 1, 'الشرح', "Ash-Sharh", 'The Consolation', 'Meccan'],
		[6098, 8, 28, 1, 'التين', "At-Tin", 'The Fig', 'Meccan'],
		[6106, 19, 1, 1, 'العلق', "Al-Alaq", 'The Clot', 'Meccan'],
		[6125, 5, 25, 1, 'القدر', "Al-Qadr", 'The Power, Fate', 'Meccan'],
		[6130, 8, 100, 1, 'البينة', "Al-Bayyina", 'The Evidence', 'Medinan'],
		[6138, 8, 93, 1, 'الزلزلة', "Az-Zalzala", 'The Earthquake', 'Medinan'],
		[6146, 11, 14, 1, 'العاديات', "Al-Aadiyaat", 'The Chargers', 'Meccan'],
		[6157, 11, 30, 1, 'القارعة', "Al-Qaari'a", 'The Calamity', 'Meccan'],
		[6168, 8, 16, 1, 'التكاثر', "At-Takaathur", 'Competition', 'Meccan'],
		[6176, 3, 13, 1, 'العصر', "Al-Asr", 'The Declining Day, Epoch', 'Meccan'],
		[6179, 9, 32, 1, 'الهمزة', "Al-Humaza", 'The Traducer', 'Meccan'],
		[6188, 5, 19, 1, 'الفيل', "Al-Fil", 'The Elephant', 'Meccan'],
		[6193, 4, 29, 1, 'قريش', "Quraish", 'Quraysh', 'Meccan'],
		[6197, 7, 17, 1, 'الماعون', "Al-Maa'un", 'Almsgiving', 'Meccan'],
		[6204, 3, 15, 1, 'الكوثر', "Al-Kawthar", 'Abundance', 'Meccan'],
		[6207, 6, 18, 1, 'الكافرون', "Al-Kaafiroon", 'The Disbelievers', 'Meccan'],
		[6213, 3, 114, 1, 'النصر', "An-Nasr", 'Divine Support', 'Medinan'],
		[6216, 5, 6, 1, 'المسد', "Al-Masad", 'The Palm Fibre', 'Meccan'],
		[6221, 4, 22, 1, 'الإخلاص', "Al-Ikhlaas", 'Sincerity', 'Meccan'],
		[6225, 5, 20, 1, 'الفلق', "Al-Falaq", 'The Dawn', 'Meccan'],
		[6230, 6, 21, 1, 'الناس', "An-Naas", 'Mankind', 'Meccan'],
	],

	//------------------ Juz Data ---------------------
	Juz : [
		// start from [suraNumber, ayaNumberInSura, ayaNumberInQuran]
		[0,0,0],
		[1, 1, 0],      [2, 142, 148],  [2, 253, 259],  [3, 93, 385],   [4, 24, 516],
		[4, 148, 640],  [5, 82, 750],   [6, 111, 899],  [7, 88, 1041],  [8, 41, 1200],
		[9, 93, 1327],  [11, 6, 1478],  [12, 53, 1648], [15, 1, 1802],  [17, 1, 2029],
		[18, 75, 2214], [21, 1, 2483],  [23, 1, 2673],  [25, 21, 2875], [27, 56, 3214],
		[29, 46, 3385], [33, 31, 3563], [36, 28, 3732], [39, 32, 4089], [41, 47, 4264],
		[46, 1, 4510],  [51, 31, 4705], [58, 1, 5104],  [67, 1, 5241],  [78, 1, 5672],
		[115,1,6236] //fake index
	],

	//------------------ Hizb Data ---------------------
	Hizb : [
		// [suraNumber, ayaNumberInSura, ayaNumberInQuran]
		[0,0,0],
		[1, 1, 0],        [2, 26, 32],      [2, 44, 50],      [2, 60, 66],
		[2, 75, 81],      [2, 92, 98],      [2, 106, 112],    [2, 124, 130],
		[2, 142, 148],    [2, 158, 164],    [2, 177, 183],    [2, 189, 195],
		[2, 203, 209],    [2, 219, 225],    [2, 233, 239],    [2, 243, 249],
		[2, 253, 259],    [2, 263, 269],    [2, 272, 278],    [2, 283, 289],
		[3, 15, 307],     [3, 33, 325],     [3, 52, 344],     [3, 75, 367],
		[3, 93, 385],     [3, 113, 405],    [3, 133, 425],    [3, 153, 445],
		[3, 171, 463],    [3, 186, 478],    [4, 1, 493],      [4, 12, 504],
		[4, 24, 516],     [4, 36, 528],     [4, 58, 550],     [4, 74, 566],
		[4, 88, 580],     [4, 100, 592],    [4, 114, 606],    [4, 135, 627],
		[4, 148, 640],    [4, 163, 655],    [5, 1, 669],      [5, 12, 680],
		[5, 27, 695],     [5, 41, 709],     [5, 51, 719],     [5, 67, 735],
		[5, 82, 750],     [5, 97, 765],     [5, 109, 777],    [6, 13, 801],
		[6, 36, 824],     [6, 59, 847],     [6, 74, 862],     [6, 95, 883],
		[6, 111, 899],    [6, 127, 915],    [6, 141, 929],    [6, 151, 939],
		[7, 1, 954],      [7, 31, 984],     [7, 47, 1000],    [7, 65, 1018],
		[7, 88, 1041],    [7, 117, 1070],   [7, 142, 1095],   [7, 156, 1109],
		[7, 171, 1124],   [7, 189, 1142],   [8, 1, 1160],     [8, 22, 1181],
		[8, 41, 1200],    [8, 61, 1220],    [9, 1, 1235],     [9, 19, 1253],
		[9, 34, 1268],    [9, 46, 1280],    [9, 60, 1294],    [9, 75, 1309],
		[9, 93, 1327],    [9, 111, 1345],   [9, 122, 1356],   [10, 11, 1374],
		[10, 26, 1389],   [10, 53, 1416],   [10, 71, 1434],   [10, 90, 1453],
		[11, 6, 1478],    [11, 24, 1496],   [11, 41, 1513],   [11, 61, 1533],
		[11, 84, 1556],   [11, 108, 1580],  [12, 7, 1602],    [12, 30, 1625],
		[12, 53, 1648],   [12, 77, 1672],   [12, 101, 1696],  [13, 5, 1711],
		[13, 19, 1725],   [13, 35, 1741],   [14, 10, 1759],   [14, 28, 1777],
		[15, 1, 1802],    [15, 50, 1851],   [16, 1, 1901],    [16, 30, 1930],
		[16, 51, 1951],   [16, 75, 1975],   [16, 90, 1990],   [16, 111, 2011],
		[17, 1, 2029],    [17, 23, 2051],   [17, 50, 2078],   [17, 70, 2098],
		[17, 99, 2127],   [18, 17, 2156],   [18, 32, 2171],   [18, 51, 2190],
		[18, 75, 2214],   [18, 99, 2238],   [19, 22, 2271],   [19, 59, 2308],
		[20, 1, 2348],    [20, 55, 2402],   [20, 83, 2430],   [20, 111, 2458],
		[21, 1, 2483],    [21, 29, 2511],   [21, 51, 2533],   [21, 83, 2565],
		[22, 1, 2595],    [22, 19, 2613],   [22, 38, 2632],   [22, 60, 2654],
		[23, 1, 2673],    [23, 36, 2708],   [23, 75, 2747],   [24, 1, 2791],
		[24, 21, 2811],   [24, 35, 2825],   [24, 53, 2843],   [25, 1, 2855],
		[25, 21, 2875],   [25, 53, 2907],   [26, 1, 2932],    [26, 52, 2983],
		[26, 111, 3042],  [26, 181, 3112],  [27, 1, 3159],    [27, 27, 3185],
		[27, 56, 3214],   [27, 82, 3240],   [28, 12, 3263],   [28, 29, 3280],
		[28, 51, 3302],   [28, 76, 3327],   [29, 1, 3340],    [29, 26, 3365],
		[29, 46, 3385],   [30, 1, 3409],    [30, 31, 3439],   [30, 54, 3462],
		[31, 22, 3490],   [32, 11, 3513],   [33, 1, 3533],    [33, 18, 3550],
		[33, 31, 3563],   [33, 51, 3583],   [33, 60, 3592],   [34, 10, 3615],
		[34, 24, 3629],   [34, 46, 3651],   [35, 15, 3674],   [35, 41, 3700],
		[36, 28, 3732],   [36, 60, 3764],   [37, 22, 3809],   [37, 83, 3870],
		[37, 145, 3932],  [38, 21, 3990],   [38, 52, 4021],   [39, 8, 4065],
		[39, 32, 4089],   [39, 53, 4110],   [40, 1, 4133],    [40, 21, 4153],
		[40, 41, 4173],   [40, 66, 4198],   [41, 9, 4226],    [41, 25, 4242],
		[41, 47, 4264],   [42, 13, 4284],   [42, 27, 4298],   [42, 51, 4322],
		[43, 24, 4348],   [43, 57, 4381],   [44, 17, 4430],   [45, 12, 4484],
		[46, 1, 4510],    [46, 21, 4530],   [47, 10, 4554],   [47, 33, 4577],
		[48, 18, 4600],   [49, 1, 4612],    [49, 14, 4625],   [50, 27, 4656],
		[51, 31, 4705],   [52, 24, 4758],   [53, 26, 4809],   [54, 9, 4854],
		[55, 1, 4901],    [56, 1, 4979],    [56, 75, 5053],   [57, 16, 5090],
		[58, 1, 5104],    [58, 14, 5117],   [59, 11, 5136],   [60, 7, 5156],
		[62, 1, 5177],    [63, 4, 5191],    [65, 1, 5217],    [66, 1, 5229],
		[67, 1, 5241],    [68, 1, 5271],    [69, 1, 5323],    [70, 19, 5393],
		[72, 1, 5447],    [73, 20, 5494],   [75, 1, 5551],    [76, 19, 5609],
		[78, 1, 5672],    [80, 1, 5758],    [82, 1, 5829],    [84, 1, 5884],
		[87, 1, 5948],    [90, 1, 6023],    [94, 1, 6090],    [100, 9, 6154],
		[115,1,6236] //fake index
	],

	//------------------ Manzil Data ---------------------
	Manzil : [
		// [sura, aya]
		[0,0],	
		[1, 1], 	[5, 1], 	[10, 1], 	[17, 1],
		[26, 1], 	[37, 1], 	[50, 1]
	],

	//------------------ Ruku Data ---------------------
	Ruku : [
		// [sura, aya]
		[0,0],	
		[1, 1], 	[2, 1], 	[2, 8], 	[2, 21], 	[2, 30],
		[2, 40], 	[2, 47], 	[2, 60], 	[2, 62], 	[2, 72],
		[2, 83], 	[2, 87], 	[2, 97], 	[2, 104], 	[2, 113],
		[2, 122], 	[2, 130], 	[2, 142], 	[2, 148], 	[2, 153],
		[2, 164], 	[2, 168], 	[2, 177], 	[2, 183], 	[2, 189],
		[2, 197], 	[2, 211], 	[2, 217], 	[2, 222], 	[2, 229],
		[2, 232], 	[2, 236], 	[2, 243], 	[2, 249], 	[2, 254],
		[2, 258], 	[2, 261], 	[2, 267], 	[2, 274], 	[2, 282],
		[2, 284], 	[3, 1], 	[3, 10], 	[3, 21], 	[3, 31],
		[3, 42], 	[3, 55], 	[3, 64], 	[3, 72], 	[3, 81],
		[3, 92], 	[3, 102], 	[3, 110], 	[3, 121], 	[3, 130],
		[3, 144], 	[3, 149], 	[3, 156], 	[3, 172], 	[3, 181],
		[3, 190], 	[4, 1], 	[4, 11], 	[4, 15], 	[4, 23],
		[4, 26], 	[4, 34], 	[4, 43], 	[4, 51], 	[4, 60],
		[4, 71], 	[4, 77], 	[4, 88], 	[4, 92], 	[4, 97],
		[4, 101], 	[4, 105], 	[4, 113], 	[4, 116], 	[4, 127],
		[4, 135], 	[4, 142], 	[4, 153], 	[4, 163], 	[4, 172],
		[5, 1], 	[5, 6], 	[5, 12], 	[5, 20], 	[5, 27],
		[5, 35], 	[5, 44], 	[5, 51], 	[5, 57], 	[5, 67],
		[5, 78], 	[5, 87], 	[5, 94], 	[5, 101], 	[5, 109],
		[5, 116], 	[6, 1], 	[6, 11], 	[6, 21], 	[6, 31],
		[6, 42], 	[6, 51], 	[6, 56], 	[6, 61], 	[6, 71],
		[6, 83], 	[6, 91], 	[6, 95], 	[6, 101], 	[6, 111],
		[6, 122], 	[6, 130], 	[6, 141], 	[6, 145], 	[6, 151],
		[6, 155], 	[7, 1], 	[7, 11], 	[7, 26], 	[7, 32],
		[7, 40], 	[7, 48], 	[7, 54], 	[7, 59], 	[7, 65],
		[7, 73], 	[7, 85], 	[7, 94], 	[7, 100], 	[7, 109],
		[7, 127], 	[7, 130], 	[7, 142], 	[7, 148], 	[7, 152],
		[7, 158], 	[7, 163], 	[7, 172], 	[7, 182], 	[7, 189],
		[8, 1],  	[8, 11], 	[8, 20], 	[8, 29], 	[8, 38],
		[8, 45], 	[8, 49], 	[8, 59], 	[8, 65], 	[8, 70],
		[9, 1], 	[9, 7], 	[9, 17], 	[9, 25], 	[9, 30],
		[9, 38], 	[9, 43], 	[9, 60], 	[9, 67], 	[9, 73],
		[9, 81], 	[9, 90], 	[9, 100], 	[9, 111], 	[9, 119],
		[9, 123], 	[10, 1], 	[10, 11], 	[10, 21], 	[10, 31],
		[10, 41], 	[10, 54], 	[10, 61], 	[10, 71], 	[10, 83],
		[10, 93], 	[10, 104], 	[11, 1], 	[11, 9], 	[11, 25],
		[11, 36], 	[11, 50], 	[11, 61], 	[11, 69], 	[11, 84],
		[11, 96], 	[11, 110], 	[12, 1], 	[12, 7], 	[12, 21],
		[12, 30], 	[12, 36], 	[12, 43], 	[12, 50], 	[12, 58],
		[12, 69], 	[12, 80], 	[12, 94], 	[12, 105], 	[13, 1],
		[13, 8], 	[13, 19], 	[13, 27], 	[13, 32], 	[13, 38],
		[14, 1], 	[14, 7], 	[14, 13], 	[14, 22], 	[14, 28],
		[14, 35], 	[14, 42], 	[15, 1], 	[15, 16], 	[15, 26],
		[15, 45], 	[15, 61], 	[15, 80], 	[16, 1], 	[16, 10],
		[16, 22], 	[16, 26], 	[16, 35], 	[16, 41], 	[16, 51],
		[16, 61], 	[16, 66], 	[16, 71], 	[16, 77], 	[16, 84],
		[16, 90], 	[16, 101], 	[16, 111], 	[16, 120], 	[17, 1],
		[17, 11], 	[17, 23], 	[17, 31], 	[17, 41], 	[17, 53],
		[17, 61], 	[17, 71], 	[17, 78], 	[17, 85], 	[17, 94],
		[17, 101], 	[18, 1], 	[18, 13], 	[18, 18], 	[18, 23],
		[18, 32], 	[18, 45], 	[18, 50], 	[18, 54], 	[18, 60],
		[18, 71], 	[18, 83], 	[18, 102], 	[19, 1], 	[19, 16],
		[19, 41], 	[19, 51], 	[19, 66], 	[19, 83], 	[20, 1],
		[20, 25], 	[20, 55], 	[20, 77], 	[20, 90], 	[20, 105],
		[20, 116], 	[20, 129], 	[21, 1], 	[21, 11], 	[21, 30],
		[21, 42], 	[21, 51], 	[21, 76], 	[21, 94], 	[22, 1],
		[22, 11], 	[22, 23], 	[22, 26], 	[22, 34], 	[22, 39],
		[22, 49], 	[22, 58], 	[22, 65], 	[22, 73], 	[23, 1],
		[23, 23], 	[23, 33], 	[23, 51], 	[23, 78], 	[23, 93],
		[24, 1], 	[24, 11], 	[24, 21], 	[24, 27], 	[24, 35],
		[24, 41], 	[24, 51], 	[24, 58], 	[24, 62], 	[25, 1],
		[25, 10], 	[25, 21], 	[25, 35], 	[25, 45], 	[25, 61],
		[26, 1], 	[26, 10], 	[26, 34], 	[26, 53], 	[26, 70],
		[26, 105], 	[26, 123], 	[26, 141], 	[26, 160], 	[26, 176],
		[26, 192], 	[27, 1], 	[27, 15], 	[27, 32], 	[27, 45],
		[27, 59], 	[27, 67], 	[27, 83], 	[28, 1], 	[28, 14],
		[28, 22], 	[28, 29], 	[28, 43], 	[28, 51], 	[28, 61],
		[28, 76], 	[29, 1], 	[29, 14], 	[29, 23], 	[29, 31],
		[29, 45], 	[29, 52], 	[29, 64], 	[30, 1], 	[30, 11],
		[30, 20], 	[30, 28], 	[30, 41], 	[30, 54], 	[31, 1],
		[31, 12], 	[31, 20], 	[32, 1], 	[32, 12], 	[32, 23],
		[33, 1], 	[33, 9], 	[33, 21], 	[33, 28], 	[33, 35],
		[33, 41], 	[33, 53], 	[33, 59], 	[33, 69], 	[34, 1],
		[34, 10], 	[34, 22], 	[34, 31], 	[34, 37], 	[34, 46],
		[35, 1], 	[35, 8], 	[35, 15], 	[35, 27], 	[35, 38],
		[36, 1], 	[36, 13], 	[36, 33], 	[36, 51], 	[36, 68],
		[37, 1], 	[37, 22], 	[37, 75], 	[37, 114], 	[37, 139],
		[38, 1], 	[38, 15], 	[38, 27], 	[38, 41], 	[38, 65],
		[39, 1], 	[39, 10], 	[39, 22], 	[39, 32], 	[39, 42],
		[39, 53], 	[39, 64], 	[39, 71], 	[40, 1], 	[40, 10],
		[40, 21], 	[40, 28], 	[40, 38], 	[40, 51], 	[40, 61],
		[40, 69], 	[40, 79], 	[41, 1], 	[41, 9], 	[41, 19],
		[41, 26], 	[41, 33], 	[41, 45], 	[42, 1], 	[42, 10],
		[42, 20], 	[42, 30], 	[42, 44], 	[43, 1], 	[43, 16],
		[43, 26], 	[43, 36], 	[43, 46], 	[43, 57], 	[43, 68],
		[44, 1], 	[44, 30], 	[44, 43], 	[45, 1], 	[45, 12],
		[45, 22], 	[45, 27], 	[46, 1], 	[46, 11], 	[46, 21],
		[46, 27], 	[47, 1], 	[47, 12], 	[47, 20], 	[47, 29],
		[48, 1], 	[48, 11], 	[48, 18], 	[48, 27], 	[49, 1],
		[49, 11], 	[50, 1], 	[50, 16], 	[50, 30], 	[51, 1],
		[51, 24], 	[51, 47], 	[52, 1], 	[52, 29], 	[53, 1],
		[53, 26], 	[53, 33], 	[54, 1], 	[54, 23], 	[54, 41],
		[55, 1], 	[55, 26], 	[55, 46], 	[56, 1], 	[56, 39],
		[56, 75], 	[57, 1], 	[57, 11], 	[57, 20], 	[57, 26],
		[58, 1], 	[58, 7], 	[58, 14], 	[59, 1], 	[59, 11],
		[59, 18], 	[60, 1], 	[60, 7], 	[61, 1], 	[61, 10],
		[62, 1], 	[62, 9], 	[63, 1], 	[63, 9], 	[64, 1],
		[64, 11], 	[65, 1], 	[65, 8], 	[66, 1], 	[66, 8],
		[67, 1], 	[67, 15], 	[68, 1], 	[68, 34], 	[69, 1],
		[69, 38], 	[70, 1], 	[70, 36], 	[71, 1], 	[71, 21],
		[72, 1], 	[72, 20], 	[73, 1], 	[73, 20], 	[74, 1],
		[74, 32], 	[75, 1], 	[75, 31], 	[76, 1], 	[76, 23],
		[77, 1], 	[77, 41], 	[78, 1], 	[78, 31], 	[79, 1],
		[79, 27], 	[80, 1], 	[81, 1], 	[82, 1], 	[83, 1],
		[84, 1], 	[85, 1], 	[86, 1], 	[87, 1], 	[88, 1],
		[89, 1], 	[90, 1], 	[91, 1], 	[92, 1], 	[93, 1],
		[94, 1], 	[95, 1], 	[96, 1], 	[97, 1], 	[98, 1],
		[99, 1], 	[100, 1], 	[101, 1], 	[102, 1], 	[103, 1],
		[104, 1], 	[105, 1], 	[106, 1], 	[107, 1], 	[108, 1],
		[109, 1], 	[110, 1], 	[111, 1], 	[112, 1], 	[113, 1],
		[114, 1]
	],

	//------------------ Page Data ---------------------
	Page : [
		// start from [suraNumber, ayaNumberInSura, ayaNumberInQuran]
		[0,0,0],	
		[1, 1, 0],       [2, 1, 7],       [2, 6, 12],      [2, 17, 23],     [2, 25, 31],     [2, 30, 36],
		[2, 38, 44],     [2, 49, 55],     [2, 58, 64],     [2, 62, 68],     [2, 70, 76],     [2, 77, 83],
		[2, 84, 90],     [2, 89, 95],     [2, 94, 100],    [2, 102, 108],   [2, 106, 112],   [2, 113, 119],
		[2, 120, 126],   [2, 127, 133],   [2, 135, 141],   [2, 142, 148],   [2, 146, 152],   [2, 154, 160],
		[2, 164, 170],   [2, 170, 176],   [2, 177, 183],   [2, 182, 188],   [2, 187, 193],   [2, 191, 197],
		[2, 197, 203],   [2, 203, 209],   [2, 211, 217],   [2, 216, 222],   [2, 220, 226],   [2, 225, 231],
		[2, 231, 237],   [2, 234, 240],   [2, 238, 244],   [2, 246, 252],   [2, 249, 255],   [2, 253, 259],
		[2, 257, 263],   [2, 260, 266],   [2, 265, 271],   [2, 270, 276],   [2, 275, 281],   [2, 282, 288],
		[2, 283, 289],   [3, 1, 293],     [3, 10, 302],    [3, 16, 308],    [3, 23, 315],    [3, 30, 322],
		[3, 38, 330],    [3, 46, 338],    [3, 53, 345],    [3, 62, 354],    [3, 71, 363],    [3, 78, 370],
		[3, 84, 376],    [3, 92, 384],    [3, 101, 393],   [3, 109, 401],   [3, 116, 408],   [3, 122, 414],
		[3, 133, 425],   [3, 141, 433],   [3, 149, 441],   [3, 154, 446],   [3, 158, 450],   [3, 166, 458],
		[3, 174, 466],   [3, 181, 473],   [3, 187, 479],   [3, 195, 487],   [4, 1, 493],     [4, 7, 499],
		[4, 12, 504],    [4, 15, 507],    [4, 20, 512],    [4, 24, 516],    [4, 27, 519],    [4, 34, 526],
		[4, 38, 530],    [4, 45, 537],    [4, 52, 544],    [4, 60, 552],    [4, 66, 558],    [4, 75, 567],
		[4, 80, 572],    [4, 87, 579],    [4, 92, 584],    [4, 95, 587],    [4, 102, 594],   [4, 106, 598],
		[4, 114, 606],   [4, 122, 614],   [4, 128, 620],   [4, 135, 627],   [4, 141, 633],   [4, 148, 640],
		[4, 155, 647],   [4, 163, 655],   [4, 171, 663],   [4, 176, 668],   [5, 3, 671],     [5, 6, 674],
		[5, 10, 678],    [5, 14, 682],    [5, 18, 686],    [5, 24, 692],    [5, 32, 700],    [5, 37, 705],
		[5, 42, 710],    [5, 46, 714],    [5, 51, 719],    [5, 58, 726],    [5, 65, 733],    [5, 71, 739],
		[5, 77, 745],    [5, 83, 751],    [5, 90, 758],    [5, 96, 764],    [5, 104, 772],   [5, 109, 777],
		[5, 114, 782],   [6, 1, 789],     [6, 9, 797],     [6, 19, 807],    [6, 28, 816],    [6, 36, 824],
		[6, 45, 833],    [6, 53, 841],    [6, 60, 848],    [6, 69, 857],    [6, 74, 862],    [6, 82, 870],
		[6, 91, 879],    [6, 95, 883],    [6, 102, 890],   [6, 111, 899],   [6, 119, 907],   [6, 125, 913],
		[6, 132, 920],   [6, 138, 926],   [6, 143, 931],   [6, 147, 935],   [6, 152, 940],   [6, 158, 946],
		[7, 1, 954],     [7, 12, 965],    [7, 23, 976],    [7, 31, 984],    [7, 38, 991],    [7, 44, 997],
		[7, 52, 1005],   [7, 58, 1011],   [7, 68, 1021],   [7, 74, 1027],   [7, 82, 1035],   [7, 88, 1041],
		[7, 96, 1049],   [7, 105, 1058],  [7, 121, 1074],  [7, 131, 1084],  [7, 138, 1091],  [7, 144, 1097],
		[7, 150, 1103],  [7, 156, 1109],  [7, 160, 1113],  [7, 164, 1117],  [7, 171, 1124],  [7, 179, 1132],
		[7, 188, 1141],  [7, 196, 1149],  [8, 1, 1160],    [8, 9, 1168],    [8, 17, 1176],   [8, 26, 1185],
		[8, 34, 1193],   [8, 41, 1200],   [8, 46, 1205],   [8, 53, 1212],   [8, 62, 1221],   [8, 70, 1229],
		[9, 1, 1235],    [9, 7, 1241],    [9, 14, 1248],   [9, 21, 1255],   [9, 27, 1261],   [9, 32, 1266],
		[9, 37, 1271],   [9, 41, 1275],   [9, 48, 1282],   [9, 55, 1289],   [9, 62, 1296],   [9, 69, 1303],
		[9, 73, 1307],   [9, 80, 1314],   [9, 87, 1321],   [9, 94, 1328],   [9, 100, 1334],  [9, 107, 1341],
		[9, 112, 1346],  [9, 118, 1352],  [9, 123, 1357],  [10, 1, 1364],   [10, 7, 1370],   [10, 15, 1378],
		[10, 21, 1384],  [10, 26, 1389],  [10, 34, 1397],  [10, 43, 1406],  [10, 54, 1417],  [10, 62, 1425],
		[10, 71, 1434],  [10, 79, 1442],  [10, 89, 1452],  [10, 98, 1461],  [10, 107, 1470], [11, 6, 1478],
		[11, 13, 1485],  [11, 20, 1492],  [11, 29, 1501],  [11, 38, 1510],  [11, 46, 1518],  [11, 54, 1526],
		[11, 63, 1535],  [11, 72, 1544],  [11, 82, 1554],  [11, 89, 1561],  [11, 98, 1570],  [11, 109, 1581],
		[11, 118, 1590], [12, 5, 1600],   [12, 15, 1610],  [12, 23, 1618],  [12, 31, 1626],  [12, 38, 1633],
		[12, 44, 1639],  [12, 53, 1648],  [12, 64, 1659],  [12, 70, 1665],  [12, 79, 1674],  [12, 87, 1682],
		[12, 96, 1691],  [12, 104, 1699], [13, 1, 1707],   [13, 6, 1712],   [13, 14, 1720],  [13, 19, 1725],
		[13, 29, 1735],  [13, 35, 1741],  [13, 43, 1749],  [14, 6, 1755],   [14, 11, 1760],  [14, 19, 1768],
		[14, 25, 1774],  [14, 34, 1783],  [14, 43, 1792],  [15, 1, 1802],   [15, 16, 1817],  [15, 32, 1833],
		[15, 52, 1853],  [15, 71, 1872],  [15, 91, 1892],  [16, 7, 1907],   [16, 15, 1915],  [16, 27, 1927],
		[16, 35, 1935],  [16, 43, 1943],  [16, 55, 1955],  [16, 65, 1965],  [16, 73, 1973],  [16, 80, 1980],
		[16, 88, 1988],  [16, 94, 1994],  [16, 103, 2003], [16, 111, 2011], [16, 119, 2019], [17, 1, 2029],
		[17, 8, 2036],   [17, 18, 2046],  [17, 28, 2056],  [17, 39, 2067],  [17, 50, 2078],  [17, 59, 2087],
		[17, 67, 2095],  [17, 76, 2104],  [17, 87, 2115],  [17, 97, 2125],  [17, 105, 2133], [18, 5, 2144],
		[18, 16, 2155],  [18, 21, 2160],  [18, 28, 2167],  [18, 35, 2174],  [18, 46, 2185],  [18, 54, 2193],
		[18, 62, 2201],  [18, 75, 2214],  [18, 84, 2223],  [18, 98, 2237],  [19, 1, 2250],   [19, 12, 2261],
		[19, 26, 2275],  [19, 39, 2288],  [19, 52, 2301],  [19, 65, 2314],  [19, 77, 2326],  [19, 96, 2345],
		[20, 13, 2360],  [20, 38, 2385],  [20, 52, 2399],  [20, 65, 2412],  [20, 77, 2424],  [20, 88, 2435],
		[20, 99, 2446],  [20, 114, 2461], [20, 126, 2473], [21, 1, 2483],   [21, 11, 2493],  [21, 25, 2507],
		[21, 36, 2518],  [21, 45, 2527],  [21, 58, 2540],  [21, 73, 2555],  [21, 82, 2564],  [21, 91, 2573],
		[21, 102, 2584], [22, 1, 2595],   [22, 6, 2600],   [22, 16, 2610],  [22, 24, 2618],  [22, 31, 2625],
		[22, 39, 2633],  [22, 47, 2641],  [22, 56, 2650],  [22, 65, 2659],  [22, 73, 2667],  [23, 1, 2673],
		[23, 18, 2690],  [23, 28, 2700],  [23, 43, 2715],  [23, 60, 2732],  [23, 75, 2747],  [23, 90, 2762],
		[23, 105, 2777], [24, 1, 2791],   [24, 11, 2801],  [24, 21, 2811],  [24, 28, 2818],  [24, 32, 2822],
		[24, 37, 2827],  [24, 44, 2834],  [24, 54, 2844],  [24, 59, 2849],  [24, 62, 2852],  [25, 3, 2857],
		[25, 12, 2866],  [25, 21, 2875],  [25, 33, 2887],  [25, 44, 2898],  [25, 56, 2910],  [25, 68, 2922],
		[26, 1, 2932],   [26, 20, 2951],  [26, 40, 2971],  [26, 61, 2992],  [26, 84, 3015],  [26, 112, 3043],
		[26, 137, 3068], [26, 160, 3091], [26, 184, 3115], [26, 207, 3138], [27, 1, 3159],   [27, 14, 3172],
		[27, 23, 3181],  [27, 36, 3194],  [27, 45, 3203],  [27, 56, 3214],  [27, 64, 3222],  [27, 77, 3235],
		[27, 89, 3247],  [28, 6, 3257],   [28, 14, 3265],  [28, 22, 3273],  [28, 29, 3280],  [28, 36, 3287],
		[28, 44, 3295],  [28, 51, 3302],  [28, 60, 3311],  [28, 71, 3322],  [28, 78, 3329],  [28, 85, 3336],
		[29, 7, 3346],   [29, 15, 3354],  [29, 24, 3363],  [29, 31, 3370],  [29, 39, 3378],  [29, 46, 3385],
		[29, 53, 3392],  [29, 64, 3403],  [30, 6, 3414],   [30, 16, 3424],  [30, 25, 3433],  [30, 33, 3441],
		[30, 42, 3450],  [30, 51, 3459],  [31, 1, 3469],   [31, 12, 3480],  [31, 20, 3488],  [31, 29, 3497],
		[32, 1, 3503],   [32, 12, 3514],  [32, 21, 3523],  [33, 1, 3533],   [33, 7, 3539],   [33, 16, 3548],
		[33, 23, 3555],  [33, 31, 3563],  [33, 36, 3568],  [33, 44, 3576],  [33, 51, 3583],  [33, 55, 3587],
		[33, 63, 3595],  [34, 1, 3606],   [34, 8, 3613],   [34, 15, 3620],  [34, 23, 3628],  [34, 32, 3637],
		[34, 40, 3645],  [34, 49, 3654],  [35, 4, 3663],   [35, 12, 3671],  [35, 19, 3678],  [35, 31, 3690],
		[35, 39, 3698],  [35, 45, 3704],  [36, 13, 3717],  [36, 28, 3732],  [36, 41, 3745],  [36, 55, 3759],
		[36, 71, 3775],  [37, 1, 3788],   [37, 25, 3812],  [37, 52, 3839],  [37, 77, 3864],  [37, 103, 3890],
		[37, 127, 3914], [37, 154, 3941], [38, 1, 3970],   [38, 17, 3986],  [38, 27, 3996],  [38, 43, 4012],
		[38, 62, 4031],  [38, 84, 4053],  [39, 6, 4063],   [39, 11, 4068],  [39, 22, 4079],  [39, 32, 4089],
		[39, 41, 4098],  [39, 48, 4105],  [39, 57, 4114],  [39, 68, 4125],  [39, 75, 4132],  [40, 8, 4140],
		[40, 17, 4149],  [40, 26, 4158],  [40, 34, 4166],  [40, 41, 4173],  [40, 50, 4182],  [40, 59, 4191],
		[40, 67, 4199],  [40, 78, 4210],  [41, 1, 4218],   [41, 12, 4229],  [41, 21, 4238],  [41, 30, 4247],
		[41, 39, 4256],  [41, 47, 4264],  [42, 1, 4272],   [42, 11, 4282],  [42, 16, 4287],  [42, 23, 4294],
		[42, 32, 4303],  [42, 45, 4316],  [42, 52, 4323],  [43, 11, 4335],  [43, 23, 4347],  [43, 34, 4358],
		[43, 48, 4372],  [43, 61, 4385],  [43, 74, 4398],  [44, 1, 4414],   [44, 19, 4432],  [44, 40, 4453],
		[45, 1, 4473],   [45, 14, 4486],  [45, 23, 4495],  [45, 33, 4505],  [46, 6, 4515],   [46, 15, 4524],
		[46, 21, 4530],  [46, 29, 4538],  [47, 1, 4545],   [47, 12, 4556],  [47, 20, 4564],  [47, 30, 4574],
		[48, 1, 4583],   [48, 10, 4592],  [48, 16, 4598],  [48, 24, 4606],  [48, 29, 4611],  [49, 5, 4616],
		[49, 12, 4623],  [50, 1, 4630],   [50, 16, 4645],  [50, 36, 4665],  [51, 7, 4681],   [51, 31, 4705],
		[51, 52, 4726],  [52, 15, 4749],  [52, 32, 4766],  [53, 1, 4784],   [53, 27, 4810],  [53, 45, 4828],
		[54, 7, 4852],   [54, 28, 4873],  [54, 50, 4895],  [55, 17, 4917],  [55, 41, 4941],  [55, 68, 4968],
		[56, 17, 4995],  [56, 51, 5029],  [56, 77, 5055],  [57, 4, 5078],   [57, 12, 5086],  [57, 19, 5093],
		[57, 25, 5099],  [58, 1, 5104],   [58, 7, 5110],   [58, 12, 5115],  [58, 22, 5125],  [59, 4, 5129],
		[59, 10, 5135],  [59, 17, 5142],  [60, 1, 5150],   [60, 6, 5155],   [60, 12, 5161],  [61, 6, 5168],
		[62, 1, 5177],   [62, 9, 5185],   [63, 5, 5192],   [64, 1, 5199],   [64, 10, 5208],  [65, 1, 5217],
		[65, 6, 5222],   [66, 1, 5229],   [66, 8, 5236],   [67, 1, 5241],   [67, 13, 5253],  [67, 27, 5267],
		[68, 16, 5286],  [68, 43, 5313],  [69, 9, 5331],   [69, 35, 5357],  [70, 11, 5385],  [70, 40, 5414],
		[71, 11, 5429],  [72, 1, 5447],   [72, 14, 5460],  [73, 1, 5475],   [73, 20, 5494],  [74, 18, 5512],
		[74, 48, 5542],  [75, 20, 5570],  [76, 6, 5596],   [76, 26, 5616],  [77, 20, 5641],  [78, 1, 5672],
		[78, 31, 5702],  [79, 16, 5727],  [80, 1, 5758],   [81, 1, 5800],   [82, 1, 5829],   [83, 7, 5854],
		[83, 35, 5882],  [85, 1, 5909],   [86, 1, 5931],   [87, 16, 5963],  [89, 1, 5993],   [89, 24, 6016],
		[91, 1, 6043],   [92, 15, 6072],  [95, 1, 6098],   [97, 1, 6125],   [98, 8, 6137],   [100, 10, 6155],
		[103, 1, 6176],  [106, 1, 6193],  [109, 1, 6207],  [112, 1, 6221],
		[115,1,6236] //fake index
	],

	//------------------ Sajda Data ---------------------
	Sajda : [
		// [suraNumber, ayaNumberInSura, type, ayaNumberInQuran]
		[7 , 206, 'recommended', 1159],
		[13, 15,  'recommended', 1721],
		[16, 50,  'recommended', 1950],
		[17, 109, 'recommended', 2137],
		[19, 58,  'recommended', 2307],
		[22, 18,  'recommended', 2612],
		[22, 77,  'recommended', 2671],
		[25, 60,  'recommended', 2914],
		[27, 26,  'recommended', 3184],
		[32, 15,  'obligatory',  3517],
		[38, 24,  'recommended', 3993],
		[41, 38,  'obligatory',  4255],
		[53, 62,  'obligatory',  4845],
		[84, 21,  'recommended', 5904],
		[96, 19,  'obligatory',  6124],
	],

	//--------------------------------------------------
	totalAyasNumber: 6236,
    totalSurasNumber: 114,
    totalPagesNumber: 604,
    totalJuzsNumber: 30,

	//--------------------------------------------------
	transList : {
		'am.sadiq': 'ሳዲቅ & ሳኒ ሐቢብ',
		'ar.jalalayn': 'تفسير الجلالين',
		'ar.muyassar': 'تفسير المیسر',
		'sq.nahi': 'Efendi Nahi',
		'sq.mehdiu': 'Feti Mehdiu',
		'sq.ahmeti': 'Sherif Ahmeti',
		'ber.mensur': 'At Mensur',
		'az.mammadaliyev': 'Məmmədəliyev & Bünyadov',
		'az.musayev': 'Musayev',
		'bn.hoque': 'জহুরুল হক',
		'bn.bengali': 'মুহিউদ্দীন খান',
		'bs.korkut': 'Korkut',
		'bs.mlivo': 'Mlivo',
		'bg.theophanov': 'Теофанов',
		'zh.jian': 'Ma Jian',
		'zh.majian': 'Ma Jian - Traditional',
		'cs.hrbek': 'Hrbek',
		'cs.nykl': 'Nykl',
		'dv.divehi': 'ދިވެހި',
		'nl.keyzer': 'Keyzer',
		'nl.leemhuis': 'Leemhuis',
		'nl.siregar': 'Siregar',
		'en.ahmedali': 'Ahmed Ali',
		'en.ahmedraza': 'Ahmed Raza Khan',
		'en.arberry': 'Arberry',
		'en.asad': 'Asad',
		'en.daryabadi': 'Daryabadi',
		'en.hilali': 'Hilali & Khan',
		'en.itani': 'Itani',
		'en.maududi': 'Maududi',
		'en.mubarakpuri': 'Mubarakpuri',
		'en.pickthall': 'Pickthall',
		'en.qarai': 'Qarai',
		'en.qaribullah': 'Qaribullah & Darwish',
		'en.sahih': 'Saheeh International',
		'en.sarwar': 'Sarwar',
		'en.shakir': 'Shakir',
		'en.wahiduddin': 'Wahiduddin Khan',
		'en.yusufali': 'Yusuf Ali',
		'en.transliteration': 'Transliteration',
		'fr.hamidullah': 'Hamidullah',
		'de.aburida': 'Abu Rida',
		'de.bubenheim': 'Bubenheim & Elyas',
		'de.khoury': 'Khoury',
		'de.zaidan': 'Zaidan',
		'ha.gumi': 'Gumi',
		'hi.farooq': 'फ़ारूक़ ख़ान & अहमद',
		'hi.hindi': 'फ़ारूक़ ख़ान & नदवी',
		'id.indonesian': 'Bahasa Indonesia',
		'id.jalalayn': 'Tafsir Jalalayn',
		'id.muntakhab': 'Quraish Shihab',
		'it.piccardo': 'Piccardo',
		'ja.japanese': 'Japanese',
		'ku.asan': 'ته‌فسیری ئاسان',
		'ko.korean': 'Korean',
		'ms.basmeih': 'Basmeih',
		'ml.abdulhameed': 'അബ്ദുല്‍ ഹമീദ് & പറപ്പൂര്‍',
		'ml.karakunnu': 'കാരകുന്ന് & എളയാവൂര്',
		'no.berg': 'Einar Berg',
		'ps.abdulwali': 'عبدالولي',
		'fa.ansarian': 'انصاریان',
		'fa.ayati': 'آیتی',
		'fa.bahrampour': 'بهرام پور',
		'fa.gharaati': 'قرائتی',
		'fa.ghomshei': 'الهی قمشه‌ای',
		'fa.khorramdel': 'خرمدل',
		'fa.khorramshahi': 'خرمشاهی',
		'fa.sadeqi': 'صادقی تهرانی',
		'fa.fooladvand': 'فولادوند',
		'fa.mojtabavi': 'مجتبوی',
		'fa.moezzi': 'معزی',
		'fa.makarem': 'مکارم شیرازی',
		'pl.bielawskiego': 'Bielawskiego',
		'pt.elhayek': 'El-Hayek',
		'ro.grigore': 'Grigore',
		'ru.abuadel': 'Абу Адель',
		'ru.muntahab': 'Аль-Мунтахаб',
		'ru.krachkovsky': 'Крачковский',
		'ru.kuliev': 'Кулиев',
		'ru.osmanov': 'Османов',
		'ru.porokhova': 'Порохова',
		'ru.sablukov': 'Саблуков',
		'sd.amroti': 'امروٽي',
		'so.abduh': 'Abduh',
		'es.asad': 'Asad',
		'es.bornez': 'Bornez',
		'es.cortes': 'Cortes',
		'es.garcia': 'Garcia',
		'sw.barwani': 'Al-Barwani',
		'sv.bernstrom': 'Bernström',
		'tg.ayati': 'Оятӣ',
		'ta.tamil': 'தமிழ்',
		'tt.nugman': 'Yakub Ibn Nugman',
		'th.thai': 'ภาษาไทย',
		'tr.golpinarli': 'Abdulbakî Gölpınarlı',
		'tr.bulac': 'Alİ Bulaç',
		'tr.transliteration': 'Çeviriyazı',
		'tr.diyanet': 'Diyanet İşleri',
		'tr.vakfi': 'Diyanet Vakfı',
		'tr.yuksel': 'Edip Yüksel',
		'tr.yazir': 'Elmalılı Hamdi Yazır',
		'tr.ozturk': 'Öztürk',
		'tr.yildirim': 'Suat Yıldırım',
		'tr.ates': 'Süleyman Ateş',
		'ur.maududi': 'ابوالاعلی مودودی',
		'ur.kanzuliman': 'احمد رضا خان',
		'ur.ahmedali': 'احمد علی',
		'ur.jalandhry': 'جالندہری',
		'ur.qadri': 'طاہر القادری',
		'ur.jawadi': 'علامہ جوادی',
		'ur.junagarhi': 'محمد جوناگڑھی',
		'ur.najafi': 'محمد حسین نجفی',
		'ug.saleh': 'محمد صالح',
		'uz.sodik': 'Мухаммад Содик'
	},

	langList : {
		ber: 'Amazigh',
		sq: 'Albanian',
		am: 'Amharic',
		ar: 'Arabic',
		az: 'Azerbaijani',
		bn: 'Bengali',
		bs: 'Bosnian',
		bg: 'Bulgarian',
		cs: 'Czech',
		dv: 'Divehi',
		nl: 'Dutch',
		en: 'English',
		fr: 'French',
		de: 'German',
		ha: 'Hausa',
		hi: 'Hindi',
		id: 'Indonesian',
		it: 'Italian',
		ja: 'Japanese',
		ko: 'Korean',
		ku: 'Kurdish',
		ms: 'Malay',
		ml: 'Malayalam',
		no: 'Norwegian',
		ps: 'Pashto',
		fa: 'Persian',
		pl: 'Polish',
		pt: 'Portuguese',
		ro: 'Romanian',
		ru: 'Russian',
		sd: 'Sindhi',
		so: 'Somali',
		es: 'Spanish',
		sw: 'Swahili',
		sv: 'Swedish',
		tg: 'Tajik',
		ta: 'Tamil',
		tt: 'Tatar',
		th: 'Thai',
		tr: 'Turkish',
		ur: 'Urdu',
		ug: 'Uyghur',
		uz: 'Uzbek',
		zh: 'Chinese'
	},

	rtlLangs : ['ar', 'fa', 'ur', 'ps', 'ug', 'sd', 'ku', 'dv']
}


export function getPageNumber(aya: number): number {
	if (aya >= 6221) return 604
	if (aya < 7) return 1
	for (let i = 1; i < QuranData.Page.length; i++) {
		if (QuranData.Page[i][2] <= aya && aya < QuranData.Page[i+1][2])
			return i
	}
	return 1
}

export function getSuraNumber(aya: number): number {
	if (aya >= 6230) return 114
	if (aya < 7) return 1
	for (let i = 1; i < QuranData.Sura.length; i++) {
		if (QuranData.Sura[i][0] <= aya && aya < QuranData.Sura[i+1][0])
			return i
	}
}

export function getJuzNumber(aya: number): number {
	if (aya >= 5672) return 30
	if (aya < 148) return 1
	for (let i = 1; i <= 30; i++) {
		if (QuranData.Juz[i][2] <= aya && aya < QuranData.Juz[i+1][2])
			return i
	}
	return 1
}

export { QuranData };

