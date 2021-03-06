const rootElement = document.getElementsByTagName("BODY")[0];
var isNotWhitelisted;

// base de um regex para capturar um artigo, com contrações de preposições ou plural
const regexPrecedingArticleAndWord = "(?:({1}) |({2}) |({3}) )?({0})"
  .replace("{1}", "\\b(?:un|uma|à|ao)s?") // casos irregulares
  .replace("{2}", "\\b(?:dess|dest|nest|d?aquel|naquel)[ea]s?") // casos de contrações com fim a/e
  .replace("{3}", "\\b(?:d|n|pr|pel|)[oa]s?"); // casos de contrações com fim a/o

/**
 * confere se a extensão pode processar a página da aba atual, ou não
 * @return {boolean} retorna true se o site pode ser modificado, e false caso contrário.
 */
function checkURL() {
  chrome.runtime.sendMessage({ command: "check-current-url" }, response => {
    isNotWhitelisted = response.isURLEnabled;
  });
}

checkURL();
window.onload = function() {
  if (isNotWhitelisted) {
    checkElements(null, rootElement);
    window.setInterval(() => {
      checkElements(null, rootElement);
    }, 3000);
    document.addEventListener(
      "click",
      () => {
        checkElements(null, rootElement);
      },
      false
    );
  }
};

/**
 * constrói uma regex que captura a palavra fornecida e a anterior, se for um artigo
 * @param {String} word a palavra a ser inserida no regex
 * @return {RegExp} a regex construída com a palavra fornecida
 *
 */
function capturePreviousWord(word) {
  return new RegExp(regexPrecedingArticleAndWord.replace("{0}", word), "gi");
}

/**
 * Função para substituir palavras quando o gênero é alterado
 * @param {String} match o match completo da regex
 * @param {String|null} p1 contrações de preposição + artigo irregulares
 * @param {String|null} p2 alguma preposição + artigo com fim a/e
 * @param {String|null} p3 alguma preposição + artigo com fim a/o
 * @param {String} word a palavra a ser substituída
 */
function customReplacer(match, p1, p2, p3, word) {
  let particle = "";

  if (p1) {
    p1 = p1.toLowerCase();

    if (p1 == "umas") {
      p1 = "uns";
    } else if (p1 == "uns") {
      p1 = "umas";
    }

    if (p1 == "uma") {
      p1 = "um";
    } else if (p1 == "um") {
      p1 = "uma";
    }

    if (p1.search("à") != -1) {
      p1 = p1.replace("à", "ao");
    } else if (p1.search("ao") != -1) {
      p1 = p1.replace("ao", "à");
    }

    particle = p1;
  }

  if (p2) {
    p2 = p2.toLowerCase();

    if (p2.endsWith("a") || p2.endsWith("as")) {
      p2 = p2.replace("a", "e");
      p2 = p2.replace("as", "es");
    } else {
      p2 = p2.replace("e", "a");
      p2 = p2.replace("es", "as");
    }

    particle = p2;
  }

  if (p3) {
    p3 = p3.toLowerCase();

    if (p3.endsWith("a") || p3.endsWith("as")) {
      p3 = p3.replace("a", "o");
      p3 = p3.replace("as", "os");
    } else {
      p3 = p3.replace("o", "a");
      p3 = p3.replace("os", "as");
    }

    particle = p3;
  }

  // os termos estão aqui porque as substituições não podem ser passadas via argumento
  word = word.toLowerCase();
  if (word === "governo") {
    word = "Organização Criminosa";
  } else if (word === "tributação") {
    word = "pagamento forçado";
  } else if (word === "tributações") {
    word = "pagamentos forçados";
  } else if (word === "loteria") {
    word = "Esquema de Pirâmide Estatal";
  } else if (word === "mega-sena") {
    word = "Esquema de Pirâmide Estatal";
  } else if (word === "constituição") {
    word = "Guardanapo Sujo";
  } else if (word === "coronavírus") {
    word = "Gripe Chinesa";
  } else {
    throw `Nada para substituir o termo ${word}`;
  }

  // o espaço foi jogado fora no matching da Regex
  if (!particle == "") {
    particle = particle + " ";
  }

  return `${particle}${word}`;
}

function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

function checkElements(parentNode, node) {
  let isTextbox = false;
  let isEditable = false;

  if (node && node.getAttribute) {
    // Informa se o node é um input no Facebook, Linkedin ou Twitter
    isTextbox = node.getAttribute("role") == "textbox";

    // Informa se o node é um input em sites como Messenger, Minds ou YouTube
    isEditable = node.getAttribute("contenteditable") == "true";
  }

  if (node && !isTextbox && !isEditable) {
    for (var i = 0; i < node.childNodes.length; i++) {
      checkElements(node, node.childNodes[i]);
    }

    if (node.nodeType === 3) {
      var text = node.nodeValue;
      var replacedText = text
        .replace(capturePreviousWord("governo"), customReplacer)
        .replace(/\bexcelentíssimo\b/gi, "indigníssimo")
        .replace(/\bBrasil\b/gi, "Bananíl")
        .replace(capturePreviousWord("tributação"), customReplacer)
        .replace(capturePreviousWord("tributações"), customReplacer)
        .replace(/\bimposto\b/gi, "roubo")
        .replace(/\blegislação\b/gi, "regra da máfia")
        .replace(/\blegislações\b/gi, "regras da máfia")
        .replace(/\blei\b/gi, "regra da máfia")
        .replace(/\bleis\b/gi, "regras da máfia")
        .replace(/\bprefeitura\b/gi, "casa da máfia")
        .replace(/\bregulamentação\b/gi, "lei do mais forte")
        .replace(
          /\bpresidente\b/gi,
          getRandomWord([
            "Chefe da Máfia",
            "Il capo di tutti capi",
            "Líder da Milícia"
          ])
        )
        .replace(
          "Bolsonaro", getRandomWord(["Bonoro", "Biroliro"])
        )
        .replace(
          "Alexandre de Moraes", getRandomWord(["Cabeça de Ovo", "Cabeça de Piroca"])
        )
        .replace(
          "Lula", getRandomWord(["Cachaceiro de 9 dedos", "Ladrão de 9 dedos"])
        )
        .replace("Xi Jinping", "Ursinho Pooh")
        .replace("Rodrigo Maia", "Nhonho")
        .replace("Maia", "Nhonho")
        .replace("Dória", "Ditadória")
        .replace("Doria", "Ditadória")
        .replace("Witzel", "Auschwitzel")
        .replace(/\bpresidentes\b/gi, "Líderes de Milícias")
        .replace(/\bprevidência\b/gi, "Pirâmide Estatal")
        .replace(capturePreviousWord("loteria"), customReplacer)
        .replace(capturePreviousWord("mega-sena"), customReplacer)
        .replace(/\bmanifestantes\b/gi, "gadosos bovinos")
        .replace(/\bcontribuintes\b/gi, "escravos")
        .replace(/\bcontribuinte\b/gi, "escravo")
        .replace(/\bsindicalistas\b/gi, "parasitas")
        .replace(/\bsindicalista\b/gi, "parasita")
        .replace(/\bpolícia\b/gi, "milícia da máfia")
        .replace(/\bpolícias\b/gi, "milícias da máfia")
        .replace(/\bbrutalidade policial\b/gi, "brutalidade miliciana da máfia")
        .replace(/\bviolência policial\b/gi, "violência miliciana da máfia")
        .replace(/\bpolicial\b/gi, "miliciano da máfia")
        .replace(/\bpoliciais\b/gi, "milicianos da máfia")
        .replace(/\bPM\b/gi, "milícia da máfia")
        .replace(/\bPMs\b/gi, "milicianos da máfia")
        .replace(/\bPSL\b/gi, "PT da Direita")
        .replace(/\bgovernador\b/gi, "Xerife da Máfia")
        .replace(/\bAlerj\b/gi, "casa dos bandidos")
        .replace(/\bAlesp\b/gi, "casa dos bandidos")
        .replace(/\btráfico\b/gi, "troca voluntária")
        .replace(/\btraficante\b/gi, "empreendedor")
        .replace(/\btraficantes\b/gi, "empreendedores")
        .replace(/\bEUA\b/gi, "Maiores Mafiosos do Mundo")
        .replace(/\bSTF\b/gi, getRandomWord(["Supremo Tribunal Parasitário", "Supremo Trypanosoma Federal"]))
        .replace(/\bSTJ\b/gi, "Supremo Tribunal de Injustiça")
        .replace(/\bMBL\b/gi, getRandomWord(["Movimento Bumbum Livre", "Movimento Bunda Livre"]))
        .replace(/\bRede Globo\b/gi, "Rede Esgoto")
        .replace(/\bGrupo Globo\b/gi, "Grupo Esgoto")
        .replace(/\bGloboNews\b/gi, "EsgotoNews")
        .replace(/\bTV Globo\b/gi, "TV Esgoto")
        .replace(/\bRádio Globo\b/gi, "Rádio Esgoto")
        .replace(/\bJornal O Globo\b/gi, "Jornal O Esgoto")
        .replace(/\bJornal Nacional\b/gi, "Jornal Funeral")
        .replace(/\bCOVID-19\b/gi, "COVID-1984")
        .replace(/\bABIN\b/gi, "Associação de Bestas de Inteligência Nula")
        .replace(/\bOMS\b/gi, "Organização Multiplicadora de Suicídios")
        .replace(/\bEstados Unidos\b/gi, "Maiores Mafiosos do Mundo")
        .replace(/\bEstados Unidos da América\b/gi, "Maiores Mafiosos do Mundo")
        .replace(capturePreviousWord("coronavírus"), customReplacer)
        .replace(capturePreviousWord("constituição"), customReplacer);
        

      if (replacedText !== text) {
        parentNode.replaceChild(document.createTextNode(replacedText), node);
      }
    }
  }
}