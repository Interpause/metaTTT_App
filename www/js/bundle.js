(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const localList = require('./lang.json').words;
const baseList = require('badwords-list').array;

class Filter {

  /**
   * Filter constructor.
   * @constructor
   * @param {object} options - Filter instance options
   * @param {boolean} options.emptyList - Instantiate filter with no blacklist
   * @param {array} options.list - Instantiate filter with custom list
   * @param {string} options.placeHolder - Character used to replace profane words.
   * @param {string} options.regex - Regular expression used to sanitize words before comparing them to blacklist.
   * @param {string} options.replaceRegex - Regular expression used to replace profane words with placeHolder.
   */
  constructor(options = {}) {
    Object.assign(this, {
      list: options.emptyList && [] || Array.prototype.concat.apply(localList, [baseList, options.list || []]),
      exclude: options.exclude || [],
      placeHolder: options.placeHolder || '*',
      regex: options.regex || /[^a-zA-Z0-9|\$|\@]|\^/g,
      replaceRegex: options.replaceRegex || /\w/g
    })
  }

  /**
   * Determine if a string contains profane language.
   * @param {string} string - String to evaluate for profanity.
   */
  isProfane(string) {
    return this.list
      .filter((word) => {
        const wordExp = new RegExp(`\\b${word.replace(/(\W)/g, '\\$1')}\\b`, 'gi');
        return !this.exclude.includes(word.toLowerCase()) && wordExp.test(string);
      })
      .length > 0 || false;
  }

  /**
   * Replace a word with placeHolder characters;
   * @param {string} string - String to replace.
   */
  replaceWord(string) {
    return string
      .replace(this.regex, '')
      .replace(this.replaceRegex, this.placeHolder);
  }

  /**
   * Evaluate a string for profanity and return an edited version.
   * @param {string} string - Sentence to filter.
   */
  clean(string) {
    return string.split(/\b/).map((word) => {
      return this.isProfane(word) ? this.replaceWord(word) : word;
    }).join('');
  }

  /**
   * Add word(s) to blacklist filter / remove words from whitelist filter
   * @param {...string} word - Word(s) to add to blacklist
   */
  addWords() {
    let words = Array.from(arguments);

    this.list.push(...words);

    words
      .map(word => word.toLowerCase())
      .forEach((word) => {
        if (this.exclude.includes(word)) {
          this.exclude.splice(this.exclude.indexOf(word), 1);
        }
      });
  }

  /**
   * Add words to whitelist filter
   * @param {...string} word - Word(s) to add to whitelist.
   */
  removeWords() {
    this.exclude.push(...Array.from(arguments).map(word => word.toLowerCase()));
  }
}

module.exports = Filter;
},{"./lang.json":2,"badwords-list":4}],2:[function(require,module,exports){
module.exports={
  "words":[
    "ahole",
    "anus",
    "ash0le",
    "ash0les",
    "asholes",
    "ass",
    "Ass Monkey",
    "Assface",
    "assh0le",
    "assh0lez",
    "asshole",
    "assholes",
    "assholz",
    "asswipe",
    "azzhole",
    "bassterds",
    "bastard",
    "bastards",
    "bastardz",
    "basterds",
    "basterdz",
    "Biatch",
    "bitch",
    "bitches",
    "Blow Job",
    "boffing",
    "butthole",
    "buttwipe",
    "c0ck",
    "c0cks",
    "c0k",
    "Carpet Muncher",
    "cawk",
    "cawks",
    "Clit",
    "cnts",
    "cntz",
    "cock",
    "cockhead",
    "cock-head",
    "cocks",
    "CockSucker",
    "cock-sucker",
    "crap",
    "cum",
    "cunt",
    "cunts",
    "cuntz",
    "dick",
    "dild0",
    "dild0s",
    "dildo",
    "dildos",
    "dilld0",
    "dilld0s",
    "dominatricks",
    "dominatrics",
    "dominatrix",
    "dyke",
    "enema",
    "f u c k",
    "f u c k e r",
    "fag",
    "fag1t",
    "faget",
    "fagg1t",
    "faggit",
    "faggot",
    "fagg0t",
    "fagit",
    "fags",
    "fagz",
    "faig",
    "faigs",
    "fart",
    "flipping the bird",
    "fuck",
    "fucker",
    "fuckin",
    "fucking",
    "fucks",
    "Fudge Packer",
    "fuk",
    "Fukah",
    "Fuken",
    "fuker",
    "Fukin",
    "Fukk",
    "Fukkah",
    "Fukken",
    "Fukker",
    "Fukkin",
    "g00k",
    "God-damned",
    "h00r",
    "h0ar",
    "h0re",
    "hells",
    "hoar",
    "hoor",
    "hoore",
    "jackoff",
    "jap",
    "japs",
    "jerk-off",
    "jisim",
    "jiss",
    "jizm",
    "jizz",
    "knob",
    "knobs",
    "knobz",
    "kunt",
    "kunts",
    "kuntz",
    "Lezzian",
    "Lipshits",
    "Lipshitz",
    "masochist",
    "masokist",
    "massterbait",
    "masstrbait",
    "masstrbate",
    "masterbaiter",
    "masterbate",
    "masterbates",
    "Motha Fucker",
    "Motha Fuker",
    "Motha Fukkah",
    "Motha Fukker",
    "Mother Fucker",
    "Mother Fukah",
    "Mother Fuker",
    "Mother Fukkah",
    "Mother Fukker",
    "mother-fucker",
    "Mutha Fucker",
    "Mutha Fukah",
    "Mutha Fuker",
    "Mutha Fukkah",
    "Mutha Fukker",
    "n1gr",
    "nastt",
    "nigger;",
    "nigur;",
    "niiger;",
    "niigr;",
    "orafis",
    "orgasim;",
    "orgasm",
    "orgasum",
    "oriface",
    "orifice",
    "orifiss",
    "packi",
    "packie",
    "packy",
    "paki",
    "pakie",
    "paky",
    "pecker",
    "peeenus",
    "peeenusss",
    "peenus",
    "peinus",
    "pen1s",
    "penas",
    "penis",
    "penis-breath",
    "penus",
    "penuus",
    "Phuc",
    "Phuck",
    "Phuk",
    "Phuker",
    "Phukker",
    "polac",
    "polack",
    "polak",
    "Poonani",
    "pr1c",
    "pr1ck",
    "pr1k",
    "pusse",
    "pussee",
    "pussy",
    "puuke",
    "puuker",
    "queer",
    "queers",
    "queerz",
    "qweers",
    "qweerz",
    "qweir",
    "recktum",
    "rectum",
    "retard",
    "sadist",
    "scank",
    "schlong",
    "screwing",
    "semen",
    "sex",
    "sexy",
    "Sh!t",
    "sh1t",
    "sh1ter",
    "sh1ts",
    "sh1tter",
    "sh1tz",
    "shit",
    "shits",
    "shitter",
    "Shitty",
    "Shity",
    "shitz",
    "Shyt",
    "Shyte",
    "Shytty",
    "Shyty",
    "skanck",
    "skank",
    "skankee",
    "skankey",
    "skanks",
    "Skanky",
    "slag",
    "slut",
    "sluts",
    "Slutty",
    "slutz",
    "son-of-a-bitch",
    "tit",
    "turd",
    "va1jina",
    "vag1na",
    "vagiina",
    "vagina",
    "vaj1na",
    "vajina",
    "vullva",
    "vulva",
    "w0p",
    "wh00r",
    "wh0re",
    "whore",
    "xrated",
    "xxx",
    "b!+ch",
    "bitch",
    "blowjob",
    "clit",
    "arschloch",
    "fuck",
    "shit",
    "ass",
    "asshole",
    "b!tch",
    "b17ch",
    "b1tch",
    "bastard",
    "bi+ch",
    "boiolas",
    "buceta",
    "c0ck",
    "cawk",
    "chink",
    "cipa",
    "clits",
    "cock",
    "cum",
    "cunt",
    "dildo",
    "dirsa",
    "ejakulate",
    "fatass",
    "fcuk",
    "fuk",
    "fux0r",
    "hoer",
    "hore",
    "jism",
    "kawk",
    "l3itch",
    "l3i+ch",
    "lesbian",
    "masturbate",
    "masterbat*",
    "masterbat3",
    "motherfucker",
    "s.o.b.",
    "mofo",
    "nazi",
    "nigga",
    "nigger",
    "nutsack",
    "phuck",
    "pimpis",
    "pusse",
    "pussy",
    "scrotum",
    "sh!t",
    "shemale",
    "shi+",
    "sh!+",
    "slut",
    "smut",
    "teets",
    "tits",
    "boobs",
    "b00bs",
    "teez",
    "testical",
    "testicle",
    "titt",
    "w00se",
    "jackoff",
    "wank",
    "whoar",
    "whore",
    "*damn",
    "*dyke",
    "*fuck*",
    "*shit*",
    "@$$",
    "amcik",
    "andskota",
    "arse*",
    "assrammer",
    "ayir",
    "bi7ch",
    "bitch*",
    "bollock*",
    "breasts",
    "butt-pirate",
    "cabron",
    "cazzo",
    "chraa",
    "chuj",
    "Cock*",
    "cunt*",
    "d4mn",
    "daygo",
    "dego",
    "dick*",
    "dike*",
    "dupa",
    "dziwka",
    "ejackulate",
    "Ekrem*",
    "Ekto",
    "enculer",
    "faen",
    "fag*",
    "fanculo",
    "fanny",
    "feces",
    "feg",
    "Felcher",
    "ficken",
    "fitt*",
    "Flikker",
    "foreskin",
    "Fotze",
    "Fu(*",
    "fuk*",
    "futkretzn",
    "gook",
    "guiena",
    "h0r",
    "h4x0r",
    "hell",
    "helvete",
    "hoer*",
    "honkey",
    "Huevon",
    "hui",
    "injun",
    "jizz",
    "kanker*",
    "kike",
    "klootzak",
    "kraut",
    "knulle",
    "kuk",
    "kuksuger",
    "Kurac",
    "kurwa",
    "kusi*",
    "kyrpa*",
    "lesbo",
    "mamhoon",
    "masturbat*",
    "merd*",
    "mibun",
    "monkleigh",
    "mouliewop",
    "muie",
    "mulkku",
    "muschi",
    "nazis",
    "nepesaurio",
    "nigger*",
    "orospu",
    "paska*",
    "perse",
    "picka",
    "pierdol*",
    "pillu*",
    "pimmel",
    "piss*",
    "pizda",
    "poontsee",
    "poop",
    "porn",
    "p0rn",
    "pr0n",
    "preteen",
    "pula",
    "pule",
    "puta",
    "puto",
    "qahbeh",
    "queef*",
    "rautenberg",
    "schaffer",
    "scheiss*",
    "schlampe",
    "schmuck",
    "screw",
    "sh!t*",
    "sharmuta",
    "sharmute",
    "shipal",
    "shiz",
    "skribz",
    "skurwysyn",
    "sphencter",
    "spic",
    "spierdalaj",
    "splooge",
    "suka",
    "b00b*",
    "testicle*",
    "titt*",
    "twat",
    "vittu",
    "wank*",
    "wetback*",
    "wichser",
    "wop*",
    "yed",
    "zabourah"
  ]
}

},{}],3:[function(require,module,exports){
module.exports = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"];
},{}],4:[function(require,module,exports){
module.exports = {
  object: require('./object'),
  array: require('./array'),
  regex: require('./regexp')
};
},{"./array":3,"./object":5,"./regexp":6}],5:[function(require,module,exports){
module.exports = {"4r5e": 1, "5h1t": 1, "5hit": 1, "a55": 1, "anal": 1, "anus": 1, "ar5e": 1, "arrse": 1, "arse": 1, "ass": 1, "ass-fucker": 1, "asses": 1, "assfucker": 1, "assfukka": 1, "asshole": 1, "assholes": 1, "asswhole": 1, "a_s_s": 1, "b!tch": 1, "b00bs": 1, "b17ch": 1, "b1tch": 1, "ballbag": 1, "balls": 1, "ballsack": 1, "bastard": 1, "beastial": 1, "beastiality": 1, "bellend": 1, "bestial": 1, "bestiality": 1, "bi+ch": 1, "biatch": 1, "bitch": 1, "bitcher": 1, "bitchers": 1, "bitches": 1, "bitchin": 1, "bitching": 1, "bloody": 1, "blow job": 1, "blowjob": 1, "blowjobs": 1, "boiolas": 1, "bollock": 1, "bollok": 1, "boner": 1, "boob": 1, "boobs": 1, "booobs": 1, "boooobs": 1, "booooobs": 1, "booooooobs": 1, "breasts": 1, "buceta": 1, "bugger": 1, "bum": 1, "bunny fucker": 1, "butt": 1, "butthole": 1, "buttmuch": 1, "buttplug": 1, "c0ck": 1, "c0cksucker": 1, "carpet muncher": 1, "cawk": 1, "chink": 1, "cipa": 1, "cl1t": 1, "clit": 1, "clitoris": 1, "clits": 1, "cnut": 1, "cock": 1, "cock-sucker": 1, "cockface": 1, "cockhead": 1, "cockmunch": 1, "cockmuncher": 1, "cocks": 1, "cocksuck": 1, "cocksucked": 1, "cocksucker": 1, "cocksucking": 1, "cocksucks": 1, "cocksuka": 1, "cocksukka": 1, "cok": 1, "cokmuncher": 1, "coksucka": 1, "coon": 1, "cox": 1, "crap": 1, "cum": 1, "cummer": 1, "cumming": 1, "cums": 1, "cumshot": 1, "cunilingus": 1, "cunillingus": 1, "cunnilingus": 1, "cunt": 1, "cuntlick": 1, "cuntlicker": 1, "cuntlicking": 1, "cunts": 1, "cyalis": 1, "cyberfuc": 1, "cyberfuck": 1, "cyberfucked": 1, "cyberfucker": 1, "cyberfuckers": 1, "cyberfucking": 1, "d1ck": 1, "damn": 1, "dick": 1, "dickhead": 1, "dildo": 1, "dildos": 1, "dink": 1, "dinks": 1, "dirsa": 1, "dlck": 1, "dog-fucker": 1, "doggin": 1, "dogging": 1, "donkeyribber": 1, "doosh": 1, "duche": 1, "dyke": 1, "ejaculate": 1, "ejaculated": 1, "ejaculates": 1, "ejaculating": 1, "ejaculatings": 1, "ejaculation": 1, "ejakulate": 1, "f u c k": 1, "f u c k e r": 1, "f4nny": 1, "fag": 1, "fagging": 1, "faggitt": 1, "faggot": 1, "faggs": 1, "fagot": 1, "fagots": 1, "fags": 1, "fanny": 1, "fannyflaps": 1, "fannyfucker": 1, "fanyy": 1, "fatass": 1, "fcuk": 1, "fcuker": 1, "fcuking": 1, "feck": 1, "fecker": 1, "felching": 1, "fellate": 1, "fellatio": 1, "fingerfuck": 1, "fingerfucked": 1, "fingerfucker": 1, "fingerfuckers": 1, "fingerfucking": 1, "fingerfucks": 1, "fistfuck": 1, "fistfucked": 1, "fistfucker": 1, "fistfuckers": 1, "fistfucking": 1, "fistfuckings": 1, "fistfucks": 1, "flange": 1, "fook": 1, "fooker": 1, "fuck": 1, "fucka": 1, "fucked": 1, "fucker": 1, "fuckers": 1, "fuckhead": 1, "fuckheads": 1, "fuckin": 1, "fucking": 1, "fuckings": 1, "fuckingshitmotherfucker": 1, "fuckme": 1, "fucks": 1, "fuckwhit": 1, "fuckwit": 1, "fudge packer": 1, "fudgepacker": 1, "fuk": 1, "fuker": 1, "fukker": 1, "fukkin": 1, "fuks": 1, "fukwhit": 1, "fukwit": 1, "fux": 1, "fux0r": 1, "f_u_c_k": 1, "gangbang": 1, "gangbanged": 1, "gangbangs": 1, "gaylord": 1, "gaysex": 1, "goatse": 1, "God": 1, "god-dam": 1, "god-damned": 1, "goddamn": 1, "goddamned": 1, "hardcoresex": 1, "hell": 1, "heshe": 1, "hoar": 1, "hoare": 1, "hoer": 1, "homo": 1, "hore": 1, "horniest": 1, "horny": 1, "hotsex": 1, "jack-off": 1, "jackoff": 1, "jap": 1, "jerk-off": 1, "jism": 1, "jiz": 1, "jizm": 1, "jizz": 1, "kawk": 1, "knob": 1, "knobead": 1, "knobed": 1, "knobend": 1, "knobhead": 1, "knobjocky": 1, "knobjokey": 1, "kock": 1, "kondum": 1, "kondums": 1, "kum": 1, "kummer": 1, "kumming": 1, "kums": 1, "kunilingus": 1, "l3i+ch": 1, "l3itch": 1, "labia": 1, "lust": 1, "lusting": 1, "m0f0": 1, "m0fo": 1, "m45terbate": 1, "ma5terb8": 1, "ma5terbate": 1, "masochist": 1, "master-bate": 1, "masterb8": 1, "masterbat*": 1, "masterbat3": 1, "masterbate": 1, "masterbation": 1, "masterbations": 1, "masturbate": 1, "mo-fo": 1, "mof0": 1, "mofo": 1, "mothafuck": 1, "mothafucka": 1, "mothafuckas": 1, "mothafuckaz": 1, "mothafucked": 1, "mothafucker": 1, "mothafuckers": 1, "mothafuckin": 1, "mothafucking": 1, "mothafuckings": 1, "mothafucks": 1, "mother fucker": 1, "motherfuck": 1, "motherfucked": 1, "motherfucker": 1, "motherfuckers": 1, "motherfuckin": 1, "motherfucking": 1, "motherfuckings": 1, "motherfuckka": 1, "motherfucks": 1, "muff": 1, "mutha": 1, "muthafecker": 1, "muthafuckker": 1, "muther": 1, "mutherfucker": 1, "n1gga": 1, "n1gger": 1, "nazi": 1, "nigg3r": 1, "nigg4h": 1, "nigga": 1, "niggah": 1, "niggas": 1, "niggaz": 1, "nigger": 1, "niggers": 1, "nob": 1, "nob jokey": 1, "nobhead": 1, "nobjocky": 1, "nobjokey": 1, "numbnuts": 1, "nutsack": 1, "orgasim": 1, "orgasims": 1, "orgasm": 1, "orgasms": 1, "p0rn": 1, "pawn": 1, "pecker": 1, "penis": 1, "penisfucker": 1, "phonesex": 1, "phuck": 1, "phuk": 1, "phuked": 1, "phuking": 1, "phukked": 1, "phukking": 1, "phuks": 1, "phuq": 1, "pigfucker": 1, "pimpis": 1, "piss": 1, "pissed": 1, "pisser": 1, "pissers": 1, "pisses": 1, "pissflaps": 1, "pissin": 1, "pissing": 1, "pissoff": 1, "poop": 1, "porn": 1, "porno": 1, "pornography": 1, "pornos": 1, "prick": 1, "pricks": 1, "pron": 1, "pube": 1, "pusse": 1, "pussi": 1, "pussies": 1, "pussy": 1, "pussys": 1, "rectum": 1, "retard": 1, "rimjaw": 1, "rimming": 1, "s hit": 1, "s.o.b.": 1, "sadist": 1, "schlong": 1, "screwing": 1, "scroat": 1, "scrote": 1, "scrotum": 1, "semen": 1, "sex": 1, "sh!+": 1, "sh!t": 1, "sh1t": 1, "shag": 1, "shagger": 1, "shaggin": 1, "shagging": 1, "shemale": 1, "shi+": 1, "shit": 1, "shitdick": 1, "shite": 1, "shited": 1, "shitey": 1, "shitfuck": 1, "shitfull": 1, "shithead": 1, "shiting": 1, "shitings": 1, "shits": 1, "shitted": 1, "shitter": 1, "shitters": 1, "shitting": 1, "shittings": 1, "shitty": 1, "skank": 1, "slut": 1, "sluts": 1, "smegma": 1, "smut": 1, "snatch": 1, "son-of-a-bitch": 1, "spac": 1, "spunk": 1, "s_h_i_t": 1, "t1tt1e5": 1, "t1tties": 1, "teets": 1, "teez": 1, "testical": 1, "testicle": 1, "tit": 1, "titfuck": 1, "tits": 1, "titt": 1, "tittie5": 1, "tittiefucker": 1, "titties": 1, "tittyfuck": 1, "tittywank": 1, "titwank": 1, "tosser": 1, "turd": 1, "tw4t": 1, "twat": 1, "twathead": 1, "twatty": 1, "twunt": 1, "twunter": 1, "v14gra": 1, "v1gra": 1, "vagina": 1, "viagra": 1, "vulva": 1, "w00se": 1, "wang": 1, "wank": 1, "wanker": 1, "wanky": 1, "whoar": 1, "whore": 1, "willies": 1, "willy": 1, "xrated": 1, "xxx": 1};
},{}],6:[function(require,module,exports){
module.exports = /\b(4r5e|5h1t|5hit|a55|anal|anus|ar5e|arrse|arse|ass|ass-fucker|asses|assfucker|assfukka|asshole|assholes|asswhole|a_s_s|b!tch|b00bs|b17ch|b1tch|ballbag|balls|ballsack|bastard|beastial|beastiality|bellend|bestial|bestiality|bi\+ch|biatch|bitch|bitcher|bitchers|bitches|bitchin|bitching|bloody|blow job|blowjob|blowjobs|boiolas|bollock|bollok|boner|boob|boobs|booobs|boooobs|booooobs|booooooobs|breasts|buceta|bugger|bum|bunny fucker|butt|butthole|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|cawk|chink|cipa|cl1t|clit|clitoris|clits|cnut|cock|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocks|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cok|cokmuncher|coksucka|coon|cox|crap|cum|cummer|cumming|cums|cumshot|cunilingus|cunillingus|cunnilingus|cunt|cuntlick|cuntlicker|cuntlicking|cunts|cyalis|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|d1ck|damn|dick|dickhead|dildo|dildos|dink|dinks|dirsa|dlck|dog-fucker|doggin|dogging|donkeyribber|doosh|duche|dyke|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fag|fagging|faggitt|faggot|faggs|fagot|fagots|fags|fanny|fannyflaps|fannyfucker|fanyy|fatass|fcuk|fcuker|fcuking|feck|fecker|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|flange|fook|fooker|fuck|fucka|fucked|fucker|fuckers|fuckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme|fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fuk|fuker|fukker|fukkin|fuks|fukwhit|fukwit|fux|fux0r|f_u_c_k|gangbang|gangbanged|gangbangs|gaylord|gaysex|goatse|God|god-dam|god-damned|goddamn|goddamned|hardcoresex|hell|heshe|hoar|hoare|hoer|homo|hore|horniest|horny|hotsex|jack-off|jackoff|jap|jerk-off|jism|jiz|jizm|jizz|kawk|knob|knobead|knobed|knobend|knobhead|knobjocky|knobjokey|kock|kondum|kondums|kum|kummer|kumming|kums|kunilingus|l3i\+ch|l3itch|labia|lust|lusting|m0f0|m0fo|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat*|masterbat3|masterbate|masterbation|masterbations|masturbate|mo-fo|mof0|mofo|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafucking|mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muff|mutha|muthafecker|muthafuckker|muther|mutherfucker|n1gga|n1gger|nazi|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers|nob|nob jokey|nobhead|nobjocky|nobjokey|numbnuts|nutsack|orgasim|orgasims|orgasm|orgasms|p0rn|pawn|pecker|penis|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|piss|pissed|pisser|pissers|pisses|pissflaps|pissin|pissing|pissoff|poop|porn|porno|pornography|pornos|prick|pricks|pron|pube|pusse|pussi|pussies|pussy|pussys|rectum|retard|rimjaw|rimming|s hit|s.o.b.|sadist|schlong|screwing|scroat|scrote|scrotum|semen|sex|sh!\+|sh!t|sh1t|shag|shagger|shaggin|shagging|shemale|shi\+|shit|shitdick|shite|shited|shitey|shitfuck|shitfull|shithead|shiting|shitings|shits|shitted|shitter|shitters|shitting|shittings|shitty|skank|slut|sluts|smegma|smut|snatch|son-of-a-bitch|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|testical|testicle|tit|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tosser|turd|tw4t|twat|twathead|twatty|twunt|twunter|v14gra|v1gra|vagina|viagra|vulva|w00se|wang|wank|wanker|wanky|whoar|whore|willies|willy|xrated|xxx)\b/gi;
},{}],7:[function(require,module,exports){
const enums = require("./enums");

window.client = {
	name:		"Guest",//Online name of client
	cur_gid:	-1,		//ID of current game session (regardless of spectating or playing)
	pid:		-1,		//Player ID, generated only once
	passwd:		-1,		//Player's device password, generated only once
	unloaded:   false,  //Specifies that first state sent should be used to initialize.
	online:		false,	//Flag for eventChecker to stop.
	timeout:	5000,	//Timeout for fetch request including polls
	tries:		3,		//Number of retries, not applicable for polls
	url:		"http://ec2-52-207-243-99.compute-1.amazonaws.com:8080",
	//url:		"http://127.0.0.1:8080",
	cur_fetches:[],		//Current fetches in progress
	reqConf: {			//The request
		method:"POST",
		mode:'cors',
		cache:'no-store',
		signal:undefined,
		headers:{
			'Content-Type':'application/json'
		},
		body:undefined
	},
	
	getSavedSessions: function(){
		return this.pingServer(enums.getSessions).then(data => {
			if(data == null) return;
			genSessMenu(data[enums.sessionMenu],false);
		});
	},
	
	getSpecSessions: function(){
		return this.pingServer(enums.getSpecSessions).then(data => {
			if(data == null) return;
			genSessMenu(data[enums.spectatorMenu],true);
		});
	},
	
	findSession: function(){
		return this.pingServer(enums.findSession).then(data => {
			if(data == null) return;
			client.cur_gid = data[enums.findingSession];
		});
	},
	
	joinSession: function(Gid){
		if(Gid == null) Gid = client.cur_gid;
		return this.pingServer(enums.join,{gid:Gid}).then(data => {
			if(data == null) return;
			client.online = true;
			client.cur_gid = data.gid;
			client.eventChecker();
			//TODO: State == error, throw GUI error
			let state = data[enums.onlineGame];
			if(state == null){
				//console.log("STATE NOT SENT");
				client.unloaded = true;
				return Promise.resolve();
			}
			if(state.plyrs.indexOf(client.pid) > -1) guiState.forfeitBtn.disabled = false;
			else guiState.forfeitBtn.disabled = true;
			return loadGame(state,true);
		});
	},
	
	quitSession: function(){
		this.pingServer(enums.leave,{gid:this.cur_gid}).then(() => btnBack());
	},
	
	eventLoops: 0, //To ensure that eventChecker isnt spamming.
	eventChecker: function(curLoop){
		if(curLoop == null){
			curLoop = client.eventLoops+1;
			client.eventLoops = client.eventLoops+1;
		}else if(curLoop != client.eventLoops) return;
		//console.log(`LOOP ${curLoop}`);
		this.pingServer(enums.openPoll,{},true).then(data => {
			if(client.online){
				client.eventChecker(curLoop);
				if(data == null) return;				
				if(data.gid != client.cur_gid) return;
				if(!client.unloaded){
					if(data[enums.onlineGame] != null){
						gui.receivePlayersInfo(data[enums.onlineGame].plyrs);
						gui.receiveBoard(data[enums.onlineGame]);
					}
				}else{
					loadGame(data[enums.onlineGame],true);
					client.unloaded = false;
				}
			}
		}).catch((err) => {
			console.log(err);
			console.log("Refreshing long poll...");
			if(client.online) client.eventChecker(curLoop);
		});
	},
	
	makeMove: function(Move){
		this.pingServer(enums.move,{gid:this.cur_gid,move:Move}).then(data => {
			if(data[enums.onlineGame] == null) return;
			gui.receivePlayersInfo(data[enums.onlineGame].plyrs);
			gui.receiveBoard(data[enums.onlineGame]);
		});
	},
	
	/** Wrapper for sendServer that adds standard data, handles errors appropriately, and adds animation for the screen. */
	pingServer: function(command,others,isPoll){
		isPoll = (isPoll==null)?false:isPoll;
		if(!isPoll)displayLoadingIndicator();
		
		let data = (others==null)?{}:others;
		data.cmd = command;
		data.pid = this.pid;
		data.passwd = this.passwd;
		data.name = this.name;
		
		//TODO sendHist and sendEvent
		
		return this.sendServer(data,this.tries,isPoll).then((reply) => {
			console.log(reply);
			if(!isPoll) hideLoadingIndicator();
			//if(reply[enums.eventReceived] != null) //TODO event manager
			return Promise.resolve(reply);
		}).catch((e) => {
			if(!isPoll) hideLoadingIndicator();
			if(e.name != "AbortError"){
				weakInternetAnim();
				console.log(e);
			}
			return Promise.resolve();
		});
	},

	/** Recursive retry based server sending. While accounting for abortion by menu change instead of timeout. */
	sendServer: function(data,tries,isPoll){
		if(tries <= 0) return Promise.reject(new Error(enums.error));
		
		let req = Object.assign({},this.reqConf);
		req.body = JSON.stringify(data);
		
		let controller = new AbortController();
		req.signal = controller.signal;
		this.cur_fetches.push(controller);
		
		let reqDone = false;
		setTimeout(() => {
			if(reqDone) return;
			controller.abort();
		},this.timeout);
		return fetch(this.url,req).then((res) => {
			reqDone = true;
			return res.json();
		}).catch((e) => {
			if(e.name == "AbortError" && this.cur_fetches.length > 0 && !isPoll) return this.sendServer(data,tries-1,isPoll);
			return Promise.reject(e);
		});
	},
	
	/** Cancels all current fetches. */
	cancelAll: function(){
		this.online = false;
		let cancels = this.cur_fetches;
		this.cur_fetches = []; //necessary condition to stop retries.
		for(let cont of cancels){
			cont.abort();
		}
	}
}
},{"./enums":8}],8:[function(require,module,exports){
/* Lazy stand-in for both custom errors, status code & logging. */
//Specific
exports.locked = "BOARD LOCKED";
exports.occupied = "SQUARE FULL";
exports.started = "GAME STARTED";
exports.ended = "GAME ENDED";
exports.full = "GAME FULL";
exports.move = "MOVE";
exports.turn = "TURN";
exports.unfound = "NOT FOUND LOL";
//General
exports.okay = "OKAY";
exports.error = "FAIL";
exports.info = "INFO";
exports.busy = "BUSY";
//Server commands
exports.getSessions = "GET SESSIONS";
exports.getSpecSessions = "GET SPEC SESSIONS";
exports.createSession = "MAKE ME A GAME";
exports.findSession = "FIND ME A GAME";
exports.openPoll = "LONG POLLING";
exports.join = "JOIN";
exports.leave = "LEAVE";
//Client states
exports.sessionMenu = "SESSION MENU";
exports.spectatorMenu = "SPEC SESSION MENU";
exports.creatingSession = "CREATING SESSION";
exports.findingSession = "FINDING SESSION";
exports.onlineGame = "ONLINE GAME";
exports.eventReceived = "EVENT RECEIVED";
},{}],9:[function(require,module,exports){
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const gameState = require("./gameState");
const enums = require("./enums");
 
/************************
 * DEFAULT GUI SETTINGS *
 ************************/
window.guiConfig = {};
guiConfig.cont = document.querySelectorAll(".TTTgame")[0]; 		/* Class of container for state. */
guiConfig.grid_pfx = "grid";									/* Assumed class prefix of grid boards. */
guiConfig.sqr_pfx = "btn";										/* Assumed class prefix of grid squares. */

window.musicPlaying = false;
window.onclick = function(){
	if(!musicPlaying) document.getElementById('bgMusic').play();
	musicPlaying = true;
};


window.gui = {
	guiconf: {}, 	/* GUI config. */
	gconf:	 {}, 	/* Game config. */
	input:   null,	/* For online mode. */
	state:   {},	/* Local copy of gameState. */
	players: [],	/* List of colours for players. */
	hist:	 [],	/* Histogram of entire game. */
	online:  false,	/* Whether game is in online mode. */
	btnList: [],	/* A list of all grid buttons. */
	olyList: [],	/* Ordered list of overlays. */
	isProc:  false, /* Whether the grid is still processing input. */
	
	/** Generates the button grid, player colours and links the buttons. */
	init:function(guiConfig,gameConfig,online){
		this.guiconf = guiConfig;
		this.gconf = gameConfig;
		this.online = online;
		
		//Reset variables.
		this.guiconf.plyColors = [];
		this.btnList = [];
		this.olyList = [];
		
		this.hist.push([enums.info,"ONLINE",this.online]);
		this.guiconf.cont.innerHTML = "";
		
		let chain = Promise.resolve();
		for(let y1 = 1;y1 <= this.gconf.grid_len;y1++){
			for(let x1 = 1;x1 <= this.gconf.grid_len;x1++){
				chain = chain.then(() => {
					let grid = document.createElement("div");
					grid.style.setProperty("grid-column",`${x1} / span 1`);
					grid.style.setProperty("grid-row",`${y1} / span 1`);
					grid.classList.add("grid");
					
					let overlay = document.createElement("div");
					overlay.style.setProperty("grid-column",`1 / span ${this.gconf.grid_len}`);
					overlay.style.setProperty("grid-row",`1 / span ${this.gconf.grid_len}`);
					overlay.classList.add("gridOly");
					grid.appendChild(overlay);
					this.olyList.push(overlay);
					
					let chain2 = Promise.resolve();
					for(let y2 = 1;y2 <= this.gconf.grid_len;y2++){
						for(let x2 = 1;x2 <= this.gconf.grid_len;x2++){
							chain2 = chain2.then(() => {
								let btn = document.createElement("button");
								btn.style.setProperty("grid-column",`${x2} / span 1`);
								btn.style.setProperty("grid-row",`${y2} / span 1`);
								btn.setAttribute(this.guiconf.grid_pfx,(y1-1)*this.gconf.grid_len+x1);
								btn.setAttribute(this.guiconf.sqr_pfx,(y2-1)*this.gconf.grid_len+x2);
								btn.addEventListener("click", this.btn_link);
								btn.disabled = true;
								btn.classList.add("sqr");
								grid.appendChild(btn);
								this.btnList.push(btn);
							});
							if(((y2-1)*this.gconf.grid_len+x2)%this.gconf.grid_len == 0){ //Keeps code in same event loop. Conveniently, the more ridiculous, the more laggy, though still async.
								chain2 = chain2.then(() => {return new Promise((callback) => {setTimeout(callback,0)})});
							}
						}
					}
					return chain2.then(() => {this.guiconf.cont.appendChild(grid)});
				});
			}
		}
		return chain;
	},
	
	/** Called by server to notify GUI of players. */
	receivePlayersInfo:function(playerList){
		//TODO future retrieve player Icons
		this.players = playerList;
		this.guiconf.plyColors = [];
		for(let i = 0; i < this.players.length; i++){
			this.guiconf.plyColors.push(`hsl(${i * (360 / this.players.length) % 360},100%,50%)`);
		}
	},
	
	/** Called by server when sending over gameState. */
	receiveBoard:function(state){		
		this.state = state;
		this.updateContainer();
		updateHeader();
		this.hist.push([enums.turn,this.state.plyr]);
		return;
	},
	
	/** Called by server to update local game on history of game. */
	receiveHist:function(histList){
		for(hist in histList){
			this.hist.push(hist);
		}
		return;
	},
	
	/** Used by server to ensure latest hists are sent. */
	getHistLen:function(){
		return this.hist.length;	
	},

	/** Updates container to reflect state with some animations. */
	updateContainer:function(){
		let chain = Promise.resolve();
		for(let btn of gui.btnList) btn.disabled = true; //Very immediate.
		//Individual buttons have to be controlled in some cases.
		for(let c = 0; c < gui.btnList.length; c++){
			let btn = gui.btnList[c];
			let i = btn.getAttribute(gui.guiconf.grid_pfx);
			let n = btn.getAttribute(gui.guiconf.sqr_pfx);
			let isWin = false;
			if(gui.state.grid[i].winner != -1) isWin = true;
			else if(gui.state.grid[i][n].winner != -1) isWin = true;
			else if(gui.state.curLock != -1 && gui.state.curLock != i) isWin = false;
			else if(gui.state.plyrs[gui.state.plyr] != client.pid) isWin = false;
			else btn.disabled = false;
			
			if(isWin) chain = chain.then(() => {
				btn.style.setProperty("z-index", "3");
				if(gui.state.grid[i].winner != -1 && gui.state.grid[i].winner != null){
					btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
					btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i].winner], "important");
				}else{
					btn.style.setProperty("transition","background-color 0s");
					btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i][n].winner], "important");
				}
			}).then((callback) => {return setTimeout(callback,0)});
		}
		
		//Controls overlays.
		for(let i = 1; i <= gui.olyList.length; i++){
			let enabled = false;
			let overlay = gui.olyList[i-1];
			if(gui.state.plyrs.length < gui.state.conf.plyr_no) enabled = true;
			else if(gui.state.plyrs[gui.state.plyr] != client.pid) enabled = true;	
			else if(gui.state.curLock == -1) enabled = false;
			else if(i == gui.state.curLock) enabled = false;
			else enabled = true;
			
			if(enabled) chain = chain.then(() => {
					overlay.style.setProperty("transition","opacity 0.2s ease-in 0s");
					overlay.style.setProperty("opacity", "0.6");
				}).then((callback) => {return setTimeout(callback,0)});
			else{
				overlay.style.setProperty("transition","opacity 0s");
				overlay.style.setProperty("opacity", "0");
			}
		}
		return chain.then(() => {
			gui.guiconf.cont.style.setProperty("color",gui.guiconf.plyColors[gui.state.plyr]);	
			if(gui.state.winner != -1){
				gui.gridWinAnim();
				menuWinAnim();
			}
		});
	},
	
	/** Change into animation function for rainbows and what not. /
	updateContainer:function(){
		return new Promise((callback,reject) => {
			let grayQ = [];
			let whiteQ = [];
			let winQ = [];
			let swinQ = [];
			
			let promises = [];
			gui.btnList.forEach((btn) => {
				promises.push(new Promise((callback) => {
					let i = btn.getAttribute(gui.guiconf.grid_pfx);
					let n = btn.getAttribute(gui.guiconf.sqr_pfx);
					if(gui.state.plyrs.length != gui.state.conf.plyr_no){
						grayQ.push(btn);
						callback();
						return;
					}
					if(gui.state.grid[i].winner != -1) swinQ.push(btn);
					else if(gui.state.grid[i][n].winner != -1) winQ.push(btn);
					else if(gui.state.curLock != -1 && gui.state.curLock != i) grayQ.push(btn);
					else if(gui.state.plyrs[gui.state.plyr] != client.pid) grayQ.push(btn);
					else whiteQ.push(btn);
					
					callback();
				}));
			});
			
			Promise.all(promises).then(() => {
				let iters = 0;
				let bufTime = (750-50) / gui.btnList.length; //There is extra till grid reappears in the anim.
				bufTime = (bufTime < this.animBuffTime)? buffTime: this.animBuffTime;
				//In order of importance of course. The things I do for anti GUI hang...
				winQ.forEach((btn) => {
					setTimeout(() => {
						let i = btn.getAttribute(gui.guiconf.grid_pfx);
						let n = btn.getAttribute(gui.guiconf.sqr_pfx);
						btn.disabled = true;
						btn.style.setProperty("transition","background-color 0s");
						btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i][n].winner], "important");
					}, bufTime * iters);
					iters++;
				});
				grayQ.forEach((btn) => {
					setTimeout(() => {
						btn.disabled = true;
						btn.style.setProperty("transition","background-color 0.2s ease-in 0s");
						btn.style.setProperty("background-color", "gray");
					}, bufTime * iters);
					iters++;
				});
				whiteQ.forEach((btn) => {
					setTimeout(() => {
						btn.disabled = false;
						btn.style.setProperty("transition","background-color 0s");
						btn.style.setProperty("background-color", "white");
					}, bufTime * iters);
					iters++;
				});
				swinQ.forEach((btn) => {
					setTimeout(() => {
						let i = btn.getAttribute(gui.guiconf.grid_pfx);
						btn.disabled = true;
						btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
						btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i].winner], "important");
					}, bufTime * iters);
					iters++;
				});
				
				gui.guiconf.cont.style.setProperty("color",gui.guiconf.plyColors[gui.state.plyr]);		
				if(gui.state.winner != -1){
					gui.gridWinAnim();
					menuWinAnim();
				}
				callback();
			}).catch((e) => {
				reject(e);
				return;
			});
		});
	},
	*/
	
	/** Winning animation for grid. */
	gridWinAnim: function(){
		this.btnList.forEach(btn => {
			btn.disabled = true;
			btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
			setTimeout(() => {
				btn.style.setProperty("z-index", "3");
				btn.style.setProperty("background-color",this.guiconf.plyColors[this.state.winner],"important");
			},200); /* waits a while for previous transitions for effect. */
		});
		this.guiconf.cont.style.setProperty("animation","winGlow 3s linear 0s infinite");
	},
	
	/** EventListener for buttons. Forwards to state.place(). */
	btn_link:function(e){
		if(gui.isProc) return;
		gui.isProc = true;
		let btn = e.target;
		if(btn.disabled) return;
		let move = [btn.getAttribute(gui.guiconf.grid_pfx),btn.getAttribute(gui.guiconf.sqr_pfx)];
		if(gui.online){
			gui.guiconf.cont.style.setProperty("color","white");
			client.makeMove(move);
			gui.isProc = false;
		}else{
			gui.guiconf.cont.style.setProperty("color","white");
			let res = gameState.place(gui.state,move).then(() => {
				gui.updateContainer();
				gui.hist.push([enums.move,move]);
				gui.isProc = false;
			});
		}
		return;
	}
}	
},{"./enums":8,"./gameState":10}],10:[function(require,module,exports){
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const enums = require("./enums");

exports.createState = function(){
	var state = {	
		/* Game state variables */
		turn    :	0,		//The number of turns that have passed.
		plyrs   :	[], 	//Player's PIDs.
		plyr	:	0,		//The index of the current player in plyrs.
		winner  :   -1,		//In the context of this game, -1 is empty, null is a draw, and any other number is a player.
		isJump  :	false,	//Whether next player is free to place anywhere.
		curLock :	-1,		//Current board in play.
		grid    :	{},		//Actual data of placements.
		conf    :	{},		//Read-only config data such as grid size & number of players.
		hist	:	[]		//History of game in turns.
	}
	return state;
}

/** Generates grid. */
exports.init = function(state,config){
	state.conf = config;
	state.conf.size = state.conf.grid_len**2;
	state.grid = {winner:-1};
	state.hist.push(state.conf);
	
	let promises = [];
	for(let i = 1; i <= state.conf.size; i++){
		promises.push(new Promise((callback) => {
			let square = {winner:-1};
			for (let n = 1; n <= state.conf.size; n++) square[n] = {winner:-1};
			state.grid[i] = square;
			callback();
		}));
	}
	return Promise.all(promises);
}

/** Places player piece. Increments state.turn, shifting to next player. */
exports.place = function(state,move){
	if(state.winner != -1) return Promise.reject(new Error(enums.error));
	if(state.curLock == -1){
		state.curLock = move[0];
		state.isJump = false;
	}else if(state.curLock != move[0]) return Promise.reject(new Error(`${enums.locked}: ${move[0]},${move[1]}`));
	else if(state.grid[move[0]][move[1]].winner != -1) return Promise.reject(new Error(`${enums.occupied}: ${move[0]},${move[1]}`));
	state.grid[move[0]][move[1]].winner = state.plyr;
	state.hist.push([state.plyrs[state.turn],move]);
		
	return exports.checkWin(state).then(() => {
		if(state.grid[move[1]].winner != -1) state.curLock = -1;
		else state.curLock = move[1];
		state.turn++;
		state.plyr = state.turn % state.conf.plyr_no;
	});
}

/** Checks winner. */
exports.checkWin = function(state){
	if(state.curLock == -1) return Promise.resolve();
	if(state.winner != -1) return Promise.resolve();
	let funcFin = false;
	
	let promises = [];
	for(let n = 1; n <= state.conf.size; n++) promises.push(new Promise((callback) => {
		let promises2 = [];
		if(funcFin) callback();
		else for(let check in state.conf.checks){
			let win = true;
			let crd = oD2D(state,n);
			for(let i = 1; win && i < state.conf.win_req; i++){
				if(state.grid[state.curLock][n].winner == -1 || state.grid[state.curLock][n].winner == null){
					win = false;
					break;
				}
				let ncrd = {x:crd.x + i * state.conf.checks[check][0],y:crd.y + i * state.conf.checks[check][1]};
				if(ncrd.y >= state.conf.grid_len | ncrd.x >= state.conf.grid_len | ncrd.y < 0 | ncrd.x < 0){
					win = false;
					break;
				}
				if(state.grid[state.curLock][tD1D(state,ncrd)].winner != state.grid[state.curLock][n].winner){
					win = false;
					break;
				}
			}
			if(!win) continue;
			state.grid[state.curLock].winner = state.plyr;
			
			for(let n = 1; n <= state.conf.size; n++) promises2.push(new Promise((callback) => {
				if(funcFin) callback();
				else for(let check in state.conf.checks){
					let gwin = true;
					let crd = oD2D(state,n);
					for(let i = 1; gwin && i < state.conf.win_req; i++){
						if(state.grid[n].winner == -1 || state.grid[n].winner == null){
							gwin = false;
							break;
						}
						let ncrd = {x:crd.x + i * state.conf.checks[check][0],y:crd.y + i * state.conf.checks[check][1]};
						if(ncrd.y >= state.conf.grid_len | ncrd.x >= state.conf.grid_len | ncrd.y < 0 | ncrd.x < 0){
							gwin = false;
							break;
						}
						if(state.grid[tD1D(state,ncrd)].winner != state.grid[n].winner){
							gwin = false;
							break;
						}
					}
					if(!gwin) continue;
					state.grid.winner = state.plyr;
					state.winner = state.plyr;
					funcFin = true;
					break;
				}
				callback();
			}));
			break;
		}
		Promise.all(promises2).then(() => {callback();});
	}));
	return Promise.all(promises).then(() => {
		let full = true;
		for(let n = 1; n <= state.conf.size && full; n++) if(state.grid[state.curLock][n].winner == -1) full = false;
		if(full && state.grid[state.curLock].winner == -1) state.grid[state.curLock].winner = null;
		
		let gfull = true;
		for(let n = 1; n <= state.conf.size && gfull; n++) if(state.grid[n].winner == -1) gfull = false;
		if(gfull && state.grid.winner == -1){
			state.grid.winner = null;
			state.winner = null;
			funcFin = true;
		}
	});
}

/** Helper function that converts 1D index to 2D. */
function oD2D(state,n){return {x:(n - 1) % state.conf.grid_len,y:Math.floor((n - 1) / state.conf.grid_len)};}

/** Helper function that converts 2D index to 1D. */
function tD1D(state,coord){return coord.y * state.conf.grid_len + coord.x + 1;}
},{"./enums":8}],11:[function(require,module,exports){
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable lhttps://goto.ri.edu.sg/?aw or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const gameState = require("./gameState");
const sessModule = require("./session");
 
window.gen_uuid = function(){
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}

window.game = null;
window.startLocalGame = function(){
	displayLoadingIndicator();
	game = sessModule.createSession();
	return gui.init(guiConfig,sessModule.gconf,false).then(() => {
		return sessModule.init(game,sessModule.gconf,gui).then(() => {
			for(let i = 0; i < sessModule.gconf.plyr_no; i++) sessModule.addPlayer(game,client.pid);	
			sessModule.start(game);
		});
	}).then(() => {
		return new Promise((callback) => {setTimeout(callback,0)}).then(() => {
			hideLoadingIndicator();
			gui.updateContainer();
		});
	});
}

window.loadGame = function(state,isOnline){
	displayLoadingIndicator();
	if(isOnline==true){
		return gui.init(guiConfig,state.conf,isOnline).then(() => {
			gui.receivePlayersInfo(state.plyrs);
			gui.receiveBoard(state);
			hideLoadingIndicator();
		});
	}else{
		game = sessModule.createSession();
		return gui.init(guiConfig,state.conf,false).then(() => {
			sessModule.restoreSession(game,state,gui);
			sessModule.start(game);
			hideLoadingIndicator();
		}).then(gui.updateContainer);
	}
}

/* Cordova stuff. */
window.app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		return;
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
		document.addEventListener("backbutton", this.onBackKey.bind(this), false);
		document.addEventListener("resume", this.onAppResume.bind(this), false);
		document.addEventListener("pause", this.onAppPause.bind(this), false);
		window.screen.orientation.lock('portrait-primary');
		StatusBar.hide();
        this.receivedEvent('deviceready');
		return;
    },
	
	/** On Pause. */
	onAppPause: function(){
		document.getElementById('bgMusic').pause();
		if(game.state.winner == -1) window.localStorage.setItem('save',JSON.stringify(game.state));
		else window.localStorage.removeItem('save');
		return;
	},
	
	/** On Resume. */
	onAppResume: function(){
		document.getElementById('bgMusic').play();
		return;
	},
	
	/** On backKey. */
	onBackKey: function(){
		btnBack();	
		return;		
	},

    // Update DOM on a Received Event
    receivedEvent: function(id) {
		switch(id){
			case "deviceready":
				
				changeFocus(guiState.gamePg);
				guiConfig.cont.style.opacity = 1;
				
				let rconfig = window.localStorage.getItem("settings");
				if(rconfig != null){
					let config = JSON.parse(rconfig);
					//client.url = config.client_url;
					client.name = config.client_name;
					if(!config.performance_mode) genBackgroundClickyTris();
				}else genBackgroundClickyTris();
				
				//FIRST TIMES
				let clientid = window.localStorage.getItem("clientid");
				if(clientid==null) clientid = gen_uuid();
				let passwd = window.localStorage.getItem("passwd");
				if(passwd==null) passwd = gen_uuid();
				client.pid = clientid;
				client.passwd = passwd;
				window.localStorage.setItem("clientid",client.pid);
				window.localStorage.setItem("passwd",client.passwd);
				//TODO tutorial done flag.
				
				let save = window.localStorage.getItem('save');
				let start = undefined; //promise
				if(save==null) start = startLocalGame();
				else{
					try{
						start = loadGame(JSON.parse(save));
					}catch(e){
						console.log(e);
						start = startLocalGame();
					}
				}
				start.then(() => {
					document.getElementById("splash").style.display = "none";
				}).catch((e) => {
					startLocalGame().then(() => {
						console.log("Retry");
						document.getElementById("splash").style.display = "none";
					});
				});
				break;
		}
		return;
    }
};

app.initialize();
},{"./gameState":10,"./session":13}],12:[function(require,module,exports){
const sessModule = require("./session");
const bgGen = require("./triangle_background");
const enums = require("./enums");
const Filter = require("bad-words");
let filter = new Filter();

/** Information about html for code. */
window.guiState = {};

guiState.forfeitBtn = document.getElementById("endSession");
guiState.loadIndicator = document.getElementById("loadingIndicator");
guiState.noInternetIndicator = document.getElementById("weakInternetIndicator");

guiState.clickSnd = document.getElementById('clkSnd');
guiState.rstSnd = document.getElementById('clkSnd');
guiState.tadaSnd = document.getElementById('tadaSnd');
guiState.snrSnd = document.getElementById('snrSnd');

//Get the pages from the document
guiState.gamePg = document.getElementById("gamePg");
guiState.settingsPg = document.getElementById("settingsPg");
guiState.creditsPg = document.getElementById("creditsPg");
guiState.onlinePg = document.getElementById("onlinePg");
guiState.onlineGamePg = document.getElementById("onlineGamePg");
guiState.spectatePg = document.getElementById("spectatePg");

guiState.pgFocus = null;				//Set to gamePg in index via changeFocus()
guiState.backSeq = [guiState.gamePg]; 	//Sequence of pages to return back through.
guiState.header = document.getElementById("onlineGameHeader");

//Functions to be called when focus is switching to the page.
guiState.gamePg.arrive = () => {return Promise.resolve(client.cancelAll())};
guiState.settingsPg.arrive = () => {
	let rconfig = window.localStorage.getItem("settings");
	if(rconfig != null){
		let config = JSON.parse(rconfig);
		let settings = document.getElementById("settingsCont");
		//settings.querySelector("input[name='client_url']").value = config.client_url;
		settings.querySelector("input[name='client_name']").value = config.client_name;
		settings.querySelector("input[name='performance_mode']").checked = config.performance_mode;
	}
	return Promise.resolve();
};
guiState.creditsPg.arrive = () => {return Promise.resolve()};
guiState.onlinePg.arrive = () => {
	client.onlineState = enums.sessionMenu;
	client.getSavedSessions();
	return Promise.resolve();
};
guiState.onlineGamePg.arrive = () => {return onlineGrid()};
guiState.spectatePg.arrive = () => {
	client.getSpecSessions();
	return Promise.resolve();
};

//Functions to be called when focus is leaving from the page.
guiState.gamePg.leave = () => {return Promise.resolve()};
guiState.settingsPg.leave = () => {return Promise.resolve()};
guiState.creditsPg.leave = () => {return Promise.resolve()};
guiState.onlinePg.leave = () => {return Promise.resolve()};
guiState.onlineGamePg.leave = () => {
	if(gui.state.names != null && gui.state.names.length == 1) client.quitSession();
	client.online = false;
	resetGrid();
	return Promise.resolve();
};
guiState.spectatePg.leave = () => {return Promise.resolve()};

//Other handlers
document.getElementById("endSession").addEventListener("click",() => client.quitSession());
document.getElementById("sobtn2").addEventListener("click",() => client.getSpecSessions());

/** Changes page focus and triggers their code... But doesn't change the page. */
window.changeFocus = function(page){
	let chain = undefined;
	if(guiState.pgFocus != null) chain = guiState.pgFocus.leave();
	else chain = Promise.resolve();
	chain = chain.then(() => {return page.arrive()});
	return chain.then(() => guiState.pgFocus = page);
}

/** Function to switch pages and animate it based on the assigned class of the page. */
guiState.pgTransitionInProg = false;
window.switchPg = function(page){
	if(guiState.pgTransitionInProg) return Promise.reject(new Error(enums.busy));
	guiState.pgTransitionInProg = true;

	return changeFocus(page).then(() => {
		page.style.setProperty("display","block");
		return new Promise(callback => setTimeout(() => {
			let curPg = guiState.backSeq[guiState.backSeq.length-1];
			if(guiState.backSeq.length > 1) curPg.classList.remove("pgFocus");
			
			let direction = "translate(0vw,0vh)";
			if(page.classList.contains("pgLeft")) direction = "translateX(100vw)";
			if(page.classList.contains("pgRight")) direction = "translateX(-100vw)";
			if(page.classList.contains("pgTop")) direction = "translateY(100vh)";
			if(page.classList.contains("pgBtm")) direction = "translateY(-100vh)";
			curPg.style.setProperty("transform",direction);
			page.classList.add("pgFocus");
			
			setTimeout(() => {
				curPg.style.setProperty("display","none");
				guiState.backSeq.push(page);
				guiState.pgTransitionInProg = false;
				callback();
			},300); //0.3s was used for transition property in CSS.
		},70)); //Safest minimum time for display block to not cancel transitions.	
	});
}

/** Essentially works like undo to return to previous pages specified by guiState.backSeq. */
window.btnBack = function(){
	if(guiState.pgTransitionInProg) return Promise.reject(new Error(enums.busy));
	guiState.clickSnd.play();
	if(guiState.backSeq.length < 2) return Promise.reject(new Error(enums.error));
	guiState.pgTransitionInProg = true;
	
	let curPg = guiState.backSeq[guiState.backSeq.length-1];
	let prevPg = guiState.backSeq[guiState.backSeq.length-2];
	return changeFocus(prevPg).then(() => {
		prevPg.style.setProperty("display","block");
		return new Promise(callback => setTimeout(() => {
			if(guiState.backSeq.length > 2) prevPg.classList.add("pgFocus");
			curPg.classList.remove("pgFocus");
			prevPg.style.setProperty("transform",null);
			
			setTimeout(() => {
				curPg.style.cssText = null;
				guiState.backSeq.pop();
				guiState.pgTransitionInProg = false;
				callback();
			},300); /* 0.3s was used for transition property in CSS. */
		},70)); /* Safest minimum time for display block to not cancel transitions. */
	});
}
for(btn of document.getElementsByClassName("backBtn")) btn.addEventListener("click", () => btnBack());

/** Handler for buttons on gamePg. Somewhat obsolete but maybe user-initiated actions could have special animations?*/
window.btnGamePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.gamePg) return;
	switch(which){
		case 'settings':
			switchPg(guiState.settingsPg);
			break;
		case 'share':
			break;
		case 'credits':
			switchPg(guiState.creditsPg);
			break;
		case 'feedback':
			LaunchReview.launch();
			break;
		case 'multiplayer':
			switchPg(guiState.onlinePg);
			break;
		case 'puzzle':
			break;
		case 'shop':
			break;
		case 'replay':
			resetGrid();
			break;
	}
}
document.getElementById("mbtn1").addEventListener("click",() => btnGamePg('settings'));
document.getElementById("mbtn2").addEventListener("click",() => btnGamePg('share'));
document.getElementById("mbtn3").addEventListener("click",() => btnGamePg('credits'));
document.getElementById("mbtn4").addEventListener("click",() => btnGamePg('feedback'));
document.getElementById("mbtn5").addEventListener("click",() => btnGamePg('multiplayer'));
document.getElementById("mbtn6").addEventListener("click",() => btnGamePg('puzzle'));
document.getElementById("mbtn7").addEventListener("click",() => btnGamePg('shop'));
document.getElementById("mbtn8").addEventListener("click",() => btnGamePg('replay'));

/** Saves settings in the settingsPg. */
window.saveSettings = function(){
	let settings = document.getElementById("settingsCont");
	let grid_len = settings.querySelector("input[name='grid_len']:checked").value;
	let plyr_no = settings.querySelector("input[name='plyr_no']:checked").value;
	let win_req = settings.querySelector("input[name='win_req']:checked").value;
	//If changes to game size and what not are made then reset the grid. 
	let changed = false;
	if(grid_len != sessModule.gconf['grid_len']){
		sessModule.gconf['grid_len'] = grid_len;
		changed = true;
	}	
	if(plyr_no != sessModule.gconf['plyr_no']){
		sessModule.gconf['plyr_no'] = plyr_no;
		changed = true;
	}
	if(win_req != sessModule.gconf['win_req']){
		sessModule.gconf['win_req'] = win_req;
		changed = true;
	}
	if(changed) resetGrid();
	
	let url = settings.querySelector("input[name='client_url']").value;
	client.url = (url == "")? client.url : url;
	let name = settings.querySelector("input[name='client_name']").value;
	name = filter.clean(name);
	client.name = (name == "")? client.name : name;
	
	let chkbox = settings.querySelector("input[name='performance_mode']");
	if(chkbox.checked){
		let bg = document.getElementById("bg");
		while(bg.hasChildNodes()) bg.removeChild(bg.lastChild);
	}else if(!bg.hasChildNodes()) genBackgroundClickyTris();
	
	let savedSettings = {
		client_url:client.url,
		client_name:client.name,
		performance_mode:chkbox.checked
	};
	window.localStorage.setItem("settings",JSON.stringify(savedSettings));
	btnBack();
}
document.getElementById("sbtn1").addEventListener("click",() => saveSettings());

/** Handler for buttons on onlinePg */
window.btnOnlinePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.onlinePg) return;
	switch(which){
		case 'quickPlay':
			client.findSession().then(() => switchPg(guiState.onlineGamePg));
			break;
		case 'spectateMenu':
			switchPg(guiState.spectatePg);
			break;
		case 'refreshPg':
			client.getSavedSessions();
			break;
	}
}
document.getElementById("obtn2").addEventListener("click",() => btnOnlinePg('spectateMenu'));
document.getElementById("obtn3").addEventListener("click",() => btnOnlinePg('refreshPg'));
document.getElementById("obtn4").addEventListener("click",() => btnOnlinePg('quickPlay'));

//Generates menu for joining online game
guiState.sessBars = Array.from(guiState.onlinePg.getElementsByClassName("sessionInfo"));
guiState.specBars = Array.from(guiState.spectatePg.getElementsByClassName("sessionInfo"));
window.genSessMenu = function(data,isSpec){
	let bars = (isSpec==true)? guiState.specBars : guiState.sessBars;
	bars.forEach(bar => bar.style.display = "none");
	let i = 0;
	for(let gid in data){
		let bar = bars[i];
		if(bar == null){
			console.log("More save states sent from server than bars?");
			return;
		}
		let curTurn = data[gid].cur;
		if(data[gid].plyrs[curTurn] == client.pid) bar.getElementsByClassName('sessInfo')[0].innerHTML = `Your Turn @ ${data[gid].turn} moves`;
		else bar.getElementsByClassName('sessInfo')[0].innerHTML = data[gid].names[curTurn] + `'s Turn @ ${data[gid].turn} moves`;
		bar.getElementsByClassName('mini')[0].onclick = () => {
			client.cur_gid = gid;
			switchPg(guiState.onlineGamePg);
		};
		
		bar.setAttribute('gid',gid);
		bar.style.display = "block";
		i++;
	}
}

//Animates the disappearance of the grid
window.hideGrid = function(){
	guiState.rstSnd.play();
	if(guiConfig.cont.style.opacity == 0) return Promise.resolve();
	
	Array.from(document.getElementsByClassName("btn")).forEach(btn => btn.style.setProperty("animation",null));
	guiConfig.cont.style = "";
	guiConfig.cont.style.setProperty("transition","transform 1.2s, opacity 0.4s linear, color 0.5s ease 0.1s");
	guiConfig.cont.style.setProperty("transform","rotate(-1440deg)");
	guiConfig.cont.style.setProperty("opacity","0");
	
	return new Promise(callback => setTimeout(callback,400)); //400ms length of opacity transition
}

//Animates the reappearance of the grid
window.showGrid = function(){
	if(guiConfig.cont.style.opacity == 1) return Promise.resolve();
	guiConfig.cont.style.setProperty("opacity","1");
	return new Promise(callback => {
		setTimeout(() => {
			guiConfig.cont.style.setProperty("transition","color 0.5s ease 0.1s");
			guiConfig.cont.style.setProperty("transform",null);
			callback();			
		},800); //800ms length of remaining rotation transition
	});
}

//Resets the grid
guiState.btnReplayInProg = false;
window.resetGrid = function(){
	if(guiState.btnReplayInProg) return Promise.reject(new Error(enums.busy));
	guiState.btnReplayInProg = true;
	return hideGrid().then(() => {
		gui.state = {};
		guiConfig.cont = document.querySelectorAll(".TTTgame")[0];
		return startLocalGame().then(() => {
			//Not returned, chain ends at game being started since used in page transition.
			showGrid().then(() => guiState.btnReplayInProg = false);
		}); 
	})	
}

//Loads online grid
window.onlineGrid = function(){
	guiConfig.cont = document.querySelectorAll(".TTTgame")[1];
	gui.state = {};
	guiState.header.innerHTML = "Waiting...";
	let conc = [hideGrid(),client.joinSession()];
	Promise.all(conc).then(() => showGrid());
	return conc[0];
}

//Update online GUI header
window.updateHeader = function(){
	if(!client.online) return;
	try{
		if(gui.state.plyrs.length < gui.state.conf.plyr_no) guiState.header.innerHTML = "Waiting...";
		else{
			let curTurn = gui.state.plyr;
			if(gui.state.plyrs[gui.state.plyr] == client.pid) guiState.header.innerHTML = `Your Turn @ ${gui.state.turn} moves`;
			else guiState.header.innerHTML = gui.state.names[gui.state.plyr] + `'s Turn @ ${gui.state.turn} moves`;
		}
	}catch(e){
		return;
	}
}

//Win animation for menu
window.menuWinAnim = function(){
	guiState.tadaSnd.play();
	Array.from(document.getElementsByClassName("btn")).forEach(btn => btn.style.setProperty("animation","winBtn 0.5s linear 0s infinite"));
}

//Small thing pops up in the center of the screen declaring poor internet
window.weakInternetAnim = function(){
	guiState.noInternetIndicator.style.opacity = 1;
	setTimeout(() => guiState.noInternetIndicator.style.opacity = 0,1000);
}

window.displayLoadingIndicator = function(){
	document.getElementById("loadingIndicator").style.opacity = 1;
}
window.hideLoadingIndicator = function(){
	document.getElementById("loadingIndicator").style.opacity = 0;
}

//Generates the interactive background and attaches it.
window.genBackgroundClickyTris = function(){
	let bg = bgGen.genBg();
	bg.style.width = "100%";
	bg.style.height = "auto";
	let tris = bg.querySelectorAll("polygon");
	tris.forEach(tri => {
		tri.onclick = function(){
			guiState.snrSnd.pause();
			guiState.snrSnd.currentTime = 0;
			guiState.snrSnd.play();
			let temp = tri.innerHTML;
			tri.innerHTML = "";
			tri.setAttribute("fill","white");
			setTimeout(() => tri.innerHTML = temp,75);
		};
	});
	document.getElementById("bg").appendChild(bg);
}
},{"./enums":8,"./session":13,"./triangle_background":14,"bad-words":1}],13:[function(require,module,exports){
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const enums = require("./enums");
const gameState = require("./gameState");

/*************************
 * DEFAULT GAME SETTINGS *
 *************************/
exports.gconf = {};
exports.gconf.grid_len = 3;				/* TTT is 3. Right? */
exports.gconf.plyr_no = 2; 				/* Number of players. */
exports.gconf.win_req = 3;				/* TTT is 3. Right? */
exports.gconf.size = 9; 				/* Do not change unless crazy. */
exports.gconf.checks = {				/* For checking winner. */
	horiz:[1,0],
	verti:[0,1],
	rdiag:[1,1],
	ldiag:[-1,1]
};

exports.createSession = function(){
	var session = {
		state	  : {},		/* The session's gameState. */
		isStarted : false,	/* Whether the game has started. Used in server. */
		numPlys	  :	0,		/* Number of players currently. */
		maxPlys	  :	0,		/* Max number of players as specified in game config. */
		numSpec   :	0,		/* Number of spectators. Actually unlimited. */
		gconfig   :	{},		/* Game config. Local default found in session.js. */
		online	  : false,	/* Whether the game is online. Determined by gui presence. */
		gui		  : null,	/* If present in init, online is true. */
		players	  : [],		/* Player's PIDs for checking. */
		specs	  : []		/* Spectator's PIDs for checking. */
	}
	return session;
}
		
/** Initializes the session. If gui is present, starts in local mode. Else server session mode. */
exports.init = function(sess,gconfig,gui){
	sess.gui = gui;
	sess.online = (gui==null);
	sess.gconfig = gconfig;
	sess.state = gameState.createState();
	sess.maxPlys = gconfig.plyr_no;
	return gameState.init(sess.state,sess.gconfig);
}

/** Restores session from saved gameState. */
exports.restoreSession = function(sess,state,gui){
	sess.gui = gui;
	sess.online = (gui==null);
	sess.state = state;
	sess.gconfig = state.conf;
	sess.maxPlys = sess.gconfig.plyr_no;
	sess.numPlys = sess.maxPlys;
	sess.players = sess.state.plyrs.slice();
	sess.specs = sess.players.slice();
	return;	
}

/** Adds player. */
exports.addPlayer = function(sess,pid){
	if(sess.isStarted){
		throw new Error(sess.started);
		return sess;
	}
	if(sess.maxPlys == sess.numPlys){
		throw new Error(enums.full);
		return sess;
	}
	sess.players.push(pid);
	exports.addSpec(sess,pid);
	sess.numPlys++;
	return sess;
}
		
/** Adds spectator. */
exports.addSpec = function(sess,pid){
	sess.specs.push(pid);
	sess.numSpec++;
	return sess;
}

/** Removes spectator. */
exports.removeSpec = function(sess,pid){
	let ind = sess.specs.indexOf(pid);
	if(ind > -1) sess.specs.splice(ind,1);
	else return sess;
	sess.numSpec--;
	return sess;
}

/** Get board. */
exports.getState = function(sess,pid){
	if(sess.specs.indexOf(pid) > -1){
		return sess.state;
	}else throw new Error(enums.locked);
	return;
}

/** Get session info. */
exports.getInfo = function(sess){
	let info = {
		started: sess.isStarted,
		numPlys: sess.numPlys,
		maxPlys: sess.maxPlys,
		gconf: sess.gconfig,
		plyrs: sess.players,
		specs: sess.specs,
		turn:  sess.state.turn,
		cur:   sess.state.plyr
	}
	return info;
}

/** Input into state. */
exports.setInput = function(sess,pid,move){
	if(sess.state.plyrs[sess.state.plyr] == pid){
		return gameState.place(sess.state,move);
	}else return Promise.reject(new Error(enums.locked));
}

/** Starts game. */
exports.start = function(sess){
	if(sess.numPlys != sess.maxPlys){
		throw new Error(enums.error);
		return sess;
	}
	if(sess.isStarted){
		throw new Error(enums.started);
		return sess;
	}
	if(!sess.online){
		sess.gui.receiveBoard(sess.state);
		sess.gui.receivePlayersInfo(sess.players);
	}
	sess.state.plyrs = sess.players;
	sess.isStarted = true;
	return sess;		
}
},{"./enums":8,"./gameState":10}],14:[function(require,module,exports){
/** Default settings for the generated background. */
const bgDefaults = {};

// Number of rows and columns of triangle sets
bgDefaults.rows = 10;
bgDefaults.cols = 4;

// In seconds, the speed of color change
bgDefaults.min_speed = 20;
bgDefaults.max_speed = 50;

// Other aesthetic settings
bgDefaults.gap_ratio = 0.15;  // Size of gap in relation to the triangles
bgDefaults.randomness = 0.75; // Smart random seriousness

// Permanent settings and Maths calculations
const tlen = 100;					// Base of triangles in arbitrary SVG units
const thgt = tlen/2*1.732050808;	// Height of triangles in arbitrary SVG units

// Colors that triangles change between.
bgDefaults.colors = ['#ffffff','#0c7c5f','#000000',
					'#fab20b','#e62840','#8862b8',
					'#fddb0d','#deddde','#ffffff',
					'#0c7c5f','#000000'];

// Shuffles color sequence of triangle based on triangle on top and to the left of it
function smart_shuffle(above,left,conf){
	let frndarr = conf.colors.slice();
	let shuffled = [];
	
	//assuming its in list, highly likely considering context of usage
	if (Math.random() < conf.randomness && above != undefined) frndarr.splice(frndarr.indexOf(above),1); 
	if (Math.random() < conf.randomness && left != undefined) frndarr.splice(frndarr.indexOf(left),1);
	
	shuffled.push(frndarr[Math.floor(Math.random() * frndarr.length)]);
	let nrndarr = conf.colors.slice();
	nrndarr.splice(nrndarr.indexOf(shuffled[0]),1);
	
	for (let i = nrndarr.length - 1; i>0; i--){
		let j = Math.floor(Math.random() * (i + 1));
		[nrndarr[i], nrndarr[j]] = [nrndarr[j], nrndarr[i]];
	}
	
	return shuffled.concat(nrndarr);
}

// Randomly generates the color and animation information of triangle
function gen_tri(above,left,conf){
	let tri = {};
	let r_seq = smart_shuffle(above,left,conf);
	r_seq.push(r_seq.slice(0,1)[0]);
	tri['color_seq'] = r_seq;
	tri['speed'] = Math.floor(Math.random()*(conf.max_speed-conf.min_speed))+conf.min_speed;
	return tri;
}

//Read-only outside of module.					
exports.bgDefaults = bgDefaults;

/** Generates SVG background. Pass changes to default settings as Object. */
exports.genBg = function(kwargs){
	let conf = Object.assign({},bgDefaults);
	if(kwargs!=null) Object.entries(kwargs).forEach(([k,v])=>conf[k]=v);
	
	//Maths
	let glen = tlen/2*conf.gap_ratio;	// Length of gap between triangles in arbitrary SVG units
	let lglen = glen/2;					// Horizontal offset for triangle points in arbitrary SVG units
	let hglen = glen/2*0.866025404;		// Vertical offset for triangle points in arbitrary SVG units
	let width = tlen*conf.cols;			// Width of SVG
	let height = thgt*conf.rows+hglen/4;// Height of SVG
	
	let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	container.setAttribute('xmlns','http://www.w3.org/2000/svg');
	container.setAttribute('viewBox',`0 0 ${width} ${height}`);
	container.setAttribute('shape-rendering','geometricPrecision');
	
	let bg = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	container.appendChild(bg);
	
	//Tracks triangle colors for smart random
	let prevarr = []; 		// Previous row of triangles
	let curarr = [];  		// Current row of triangles
	let prevc = undefined;	// Color of previous generated triangle
	
	//Flags
	let isUpright = false;  //Each row is flipped upside down from the next
	
	for(let y = 0; y < conf.rows*2; y++){
		if(y%2==0) isUpright = true;
		else isUpright = false;
		
		//For first triangle (wrapped around screen)
		let tri1 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		let tri2 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		
		//Fill of triangle
		let tri_p = gen_tri(prevarr[0],prevc,conf);
		tri1.setAttribute('fill',tri_p['color_seq'][0]);
		tri2.setAttribute('fill',tri_p['color_seq'][0]);
		curarr.push(tri_p['color_seq'][0]);
		prevc = tri_p['color_seq'][0];
		
		//Different calculation of points if triangle upright versus not
		let p1x1 = 0;
		let p1y1 = y*thgt+((isUpright)?hglen:glen)/2;
		let p2x1 = 0;
		let p2y1 = (y+1)*thgt-((isUpright)?glen:hglen)/2;
		let p3x1 = tlen/2-lglen;
		let p3y1 = (isUpright)?y*thgt+hglen/2:(y+1)*thgt-hglen/2;
		
		let p1x2 = width;
		let p1y2 = p1y1;
		let p2x2 = width;
		let p2y2 = p2y1;
		let p3x2 = width-tlen/2+lglen;
		let p3y2 = p3y1;
		
		tri1.setAttribute('points',`${p1x1},${p1y1} ${p2x1},${p2y1} ${p3x1},${p3y1}`);
		tri2.setAttribute('points',`${p1x2},${p1y2} ${p2x2},${p2y2} ${p3x2},${p3y2}`);
		tri1.setAttribute('shape-rendering','geometricPrecision');
		tri2.setAttribute('shape-rendering','geometricPrecision');
		
		//Animation element of triangle
		let anim = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
		anim.setAttribute('attributeName','fill');
		anim.setAttribute('values',`${tri_p['color_seq'].join(';')};`);
		anim.setAttribute('dur',`${tri_p['speed']}s`);
		anim.setAttribute('repeatCount',"indefinite");
		
		tri1.appendChild(anim.cloneNode(true));
		tri2.appendChild(anim.cloneNode(true));
		bg.appendChild(tri1);
		bg.appendChild(tri2);
		
		//For rest of triangles in row
		for(let x = 1; x < conf.cols*2; x++){
			let tri = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
			
			let tri_p = gen_tri(prevarr[x],prevc,conf);
			tri.setAttribute('fill',tri_p['color_seq'][0]);
			curarr.push(tri_p['color_seq'][0]);
			prevc = tri_p['color_seq'][0];


			let p1x = (x-1)*tlen/2+lglen;
			let p1y = (isUpright)?(y+1)*thgt-hglen/2:y*thgt+hglen/2;
			let p2x = (x+1)*tlen/2-lglen;
			let p2y = (isUpright)?(y+1)*thgt-hglen/2:y*thgt+hglen/2;;
			let p3x = x*tlen/2;
			let p3y = (isUpright)?y*thgt+glen/2:(y+1)*thgt-glen/2;
			
			tri.setAttribute('points',`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`);
			tri.setAttribute('shape-rendering','geometricPrecision');
			
			let anim = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
			anim.setAttribute('attributeName','fill');
			anim.setAttribute('values',`${tri_p['color_seq'].join(';')};`);
			anim.setAttribute('dur',`${tri_p['speed']}s`);
			anim.setAttribute('repeatCount',"indefinite");
			
			tri.appendChild(anim);
			bg.appendChild(tri);
			
			isUpright = !isUpright;
		}
		prevc = undefined;
		prevarr = curarr;
		curarr = [];
	}
	return container;
};
},{}]},{},[11,12,9,7]);
