var map, zoomify;
var vectors;
var layer, markers;
var newl;
var guardaSelectd;
var selectFeature;
var selectCtrl;
var panZoomBar;
var selected = false;
var feature;
var browser = false;
var backgrounPopup;
var lb;

OpenLayers.Feature.Vector.style["default"]["strokeWidth"] = "0";
OpenLayers.Feature.Vector.style["default"]["fillOpacity"] = "0";

//funcao que retira caracter 04/11/2013 - janivan ramos
function replaceAll(string, token, newtoken) {
  while (string.indexOf(token) !== -1) {
    string = string.replace(token, newtoken);
  }
  return string;
}

//centraliza o box da descricao preenchendo o elemento
function ajustBoxes(obj) {
  var item = null;

  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === obj) {
      if (i === 12) {
        arr[i].titulo = "José Ignacio Antonio López- -Rayón";
      }

      item = arr[i];

      break;
    }
  }

  // descrição referente ao titulo
  var str = item.descricao;
  //oculta box
  $("#box").hide();

  //adiciona o titulo do box
  $("#tituloGlyph").html("<b>" + item.titulo + "</b> </font>");
  //adiciona o a destrição do box
  $("#contetGlyph").html(" " + item.descricao + " ");
  //abri o box
  $("#contentBox").show();

  //tempo para fechar o box
  setTimeout(function () {
    $("#contentBox").hide();
  }, 10);
  //tempo para abri o box
  setTimeout(function () {
    $("#contentBox").show("fast");
  }, 500);
  //oculta a caixa sobre a imagem
  $("#caixaSobre").hide();
  //cria a conteudo conforme o tamanho do texto
  $("#contetGlyph").css({
    height: "auto",
  });
  //se o titulo do box for maior aumenta o box
  if (document.getElementById("contetGlyph").offsetHeight > 180) {
    $("#contetGlyph").css({
      height: "211px",
    });
    $("#contentBox").css({
      height: "295px",
    });
    //a classe vai ser adicionado caso nao for mobile
    $("#contetGlyph").addClass(isMobile() ? "" : "jump_menu_content");
  } else {
    //remove a classe se for mobile
    $("#contetGlyph").removeClass(isMobile() ? "" : "jump_menu_content");
    //o conteudo do box aumenta altura
    $("#contentBox").css({
      height: $("#contetGlyph").height() + 110 + "px",
    });
  }
  /*ajustes internet explorer para div contetGlyph */
  if (navigator.userAgent.match(/MSIE/)) {
    /* ajusta a posição do slider e do botão de abrir sobre */
    $("#contetGlyph").css({
      height: "214px",
    });
  }
  if (document.selection) {
    document.selection.empty();
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }
  $("#contetGlyph").animate({
    scrollTop: 0,
  });
}

//abri o conteudo do box e fazendo as marcacoes no analise de imagem
function showContentBox(event) {
  if (selected) {
    ajustBoxes(feature);
  } else {
    $("#contentBox").hide();
  }
}
//remove as marcacoes
function unSelect(event) {
  selectFeature.unselectAll();
  selected = false;
}
//abri o conteudo do botao sobre a imagem
function showContentBoxBrowser(event) {
  browser = true;
}
//seleciona a imagem com o oconteudo
function onFeatureSelect(event) {
  if (panZoomBar) {
    panZoomBar.redraw();
  }
  feature = event.feature.id;
  lb = document.getElementById("comboMarkers");
  for (var i = 0; i < lb.length; i++) {
    if (lb.options[i].value === feature) {
      lb.options[i].selected = true;
    }
  }
  selected = true;
  if (browser) {
    showContentBox(event);
    browser = false;
  }
}
//remove a seleção e oculta o box do list menu
function onFeatureUnselect(event) {
  lb = document.getElementById("comboMarkers");
  lb.options[lb.selectedIndex].selected = false;
  lb.options.selectedIndex = 0;
  $("#contentBox").hide();
  feature = event.feature;
}

/** touchScroll */
function isTouchDevice() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}

//posiciona o x e o y do analise de iamgem
function setPosition(obj) {
  //inicializa a variavel para poder receber o arquivo de configuração do array
  var item;
  //laço do arquivo
  for (var i = 0; i < arr.length; i++) {
    //se o objeto for igual
    if (arr[i].id === obj) {
      //o item recebe o array do arquivo de configuração
      item = arr[i];
    }
  }
  //variavel que recebe uma funcao do openlayres para fazer o posicionamento
  var lonlat = new OpenLayers.LonLat(item.positionX, item.positionY);

  map.panTo(lonlat);
}

//centraliza o box sbre a imagem
function centralizaBox() {
  // larguara da tela
  var clientWidth = $(window).width();
  //altura da tela
  var clientHeight = $(window).height();
  //largura do box sobre a imagem
  var widthContent = $("#box").width();
  //altura do box sobre a imagem
  var heightContent = $("#box").height();

  //largura 2 da caixa sobre a imagem
  var widthContent2 = $("#caixaSobre").width();
  //altura 2 da caixa sobre a imagem
  var heightContent2 = $("#caixaSobre").height();

  /* calculo para centralizar (tela/2) - (container/2) */
  var leftContent = clientWidth / 2 - widthContent / 2;
  var topContent = clientHeight / 2 - heightContent / 2;
  //calculo da caixa sobre a imagem lado esquerdo
  var leftContent2 = clientWidth / 2 - widthContent2 / 2;
  //calculo da caixa sobre a imagem lado direito
  var topContent2 = clientHeight / 2 - heightContent2 / 2;

  //se o tamanho da tela for maior que altura da tela vai para o portrait
  if (clientWidth < clientHeight) {
    /*Portrait*/
    $("#box").css({
      left: leftContent + "px",
      top: topContent + "px",
    });
    $("#caixaSobre").css({
      left: leftContent2 + "px",
      top: topContent2 + "px",
    });
  } else {
    /*LandScape*/
    $("#box").css({
      left: leftContent + "px",
      top: topContent + "px",
    });
    $("#caixaSobre").css({
      left: leftContent2 + "px",
      top: topContent2 + "px",
    });
  }
}

//carrega a tela criando o analise de imagem
function init() {
  /** Adicionar imagens geradas pelo Zoomify Converter */
  var zoomify = new OpenLayers.Layer.Zoomify(
    "Zoomify",
    zoomify_url,
    new OpenLayers.Size(zoomify_width, zoomify_height)
  );

  var options = {
    maxExtent: new OpenLayers.Bounds(0, 0, zoomify_width, zoomify_height),
    maxResolution: Math.pow(2, zoomify.numberOfTiers - 1),
    numZoomLevels: zoomify.numberOfTiers,
    units: "pixels",
    eventListeners: {
      touchend: showContentBox,
      touchmove: unSelect,
      mouseup: showContentBoxBrowser,
    },
  };

  map = new OpenLayers.Map("map", options);
  map.addLayer(zoomify);
  map.setBaseLayer(zoomify);

  vectors = new OpenLayers.Layer.Vector("vector", {
    isBaseLayer: false,
  });
  map.addLayers([vectors]);
  //cria o select list menu
  var optionsSelect =
    "<select id='comboMarkers' name='comboMarkers' onchange='selectMarker(this.value);if (panZoomBar) {panZoomBar.redraw();}' onclick='if (panZoomBar) {panZoomBar.redraw();}'> <option> Escolha um item. </option>";
  //laço  que faz a marcação do analise
  for (var i = 0; i < arr.length; i++) {
    var v = new OpenLayers.Feature.Vector(
      OpenLayers.Geometry.fromWKT(arr[i].poligono)
    );
    vectors.addFeatures([v]);
    arr[i].id = v.id;
  }
  //ordena os list menu
  if (ordem_alfabetica) {
    var arr2 = [];
    for (i = 0; i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    //função colocando a ordenação
    arr2.sort(function (a, b) {
      //tirar as aspas quando existe
      var nameA = replaceAll(a.titulo.latinise(), "“", ""),
        nameB = replaceAll(b.titulo.latinise(), "“", "");
      //se NameA for menor q B coloca na frente
      if (nameA < nameB) {
        return -1;
      }
      //se NameA for maior q B adiciona na frente
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
    //faz o laço e lista o menu
    for (i = 0; i < arr2.length; i++) {
      if (i === 8) {
        arr2[i].titulo = "José Ignacio Antonio López-Rayón";
      }

      optionsSelect +=
        "<option value=" + arr2[i].id + ">" + arr2[i].titulo + "</option>";
    }
  }
  //fecha a tag </select>
  document.getElementById("slicer").innerHTML = optionsSelect + " </select>";

  selectFeature = new OpenLayers.Control.SelectFeature(vectors);
  selectFeature.handlers.feature.stopDown = false;
  map.addControl(selectFeature);
  selectFeature.activate();

  vectors.events.on({
    featureselected: onFeatureSelect,
    featureunselected: onFeatureUnselect,
  });

  var report = function (e) {
    OpenLayers.Console.log(e.type, e.feature.id);
  };

  var highlightCtrl = new OpenLayers.Control.SelectFeature(vectors, {
    hover: true,
    highlightOnly: true,
    renderIntent: "temporary",
    eventListeners: {
      beforefeaturehighlighted: report,
      featurehighlighted: report,
      featureunhighlighted: report,
    },
  });

  selectCtrl = new OpenLayers.Control.SelectFeature(vectors, {
    clickout: true,
  });
  highlightCtrl.handlers.feature.stopDown = false;
  selectCtrl.handlers.feature.stopDown = false;
  map.addControl(highlightCtrl);
  map.addControl(selectCtrl);
  highlightCtrl.activate();
  selectCtrl.activate();
  /*************************/
  var navegador = isMobile();
  //para os mobile, navegador
  if (navegador === true) {
    /*Mobile*/
    //caso seja ie 9 o box vai para o lado esquerdo
    if (navigator.userAgent.match(/MSIE 9.0/)) {
      $("#tituloAbout").css({
        "margin-left": "-275px",
      });
    }
    $("#maisZoom").show();
    $("#menosZoom").show();
    $("#comboMarkers").css({
      width: "271px",
    });
    /* ajusta a posição do slider e do botão de abrir sobre */
    $("#menosZoom").css({
      "margin-left":
        $("#resetZoom").width() +
        $("#aboutBox").width() +
        $("#hideMarkers").width() +
        11,
    });
    $("#maisZoom").css({
      "margin-left":
        $("#resetZoom").width() +
        $("#aboutBox").width() +
        $("#hideMarkers").width() +
        $("#menosZoom").width() +
        13,
    });
    $("#slicer").css({
      left:
        $("#resetZoom").width() +
        $("#aboutBox").width() +
        $("#hideMarkers").width() +
        $("#menosZoom").width() +
        $("#maisZoom").width() +
        16,
    });
    $("#abrirSobre").css({
      left:
        $("#resetZoom").width() +
        $("#aboutBox").width() +
        $("#hideMarkers").width() +
        $("#menosZoom").width() +
        $("#maisZoom").width() +
        $("#slicer").width() +
        21,
    });
    $("#slicer").css({
      "margin-top": "5px",
    });
  } else {
    $("#conteudoSobre").addClass("jump_menu_content");
    panZoomBar = new OpenLayers.Control.PanZoomBar();
    map.addControl(panZoomBar);
    $("#comboMarkers").css({
      width: "253px",
    });
    /* ajusta a posição do slider e do botão de abrir sobre */
    $("#slicer").css({
      left:
        $("#resetZoom").width() +
        $("#aboutBox").width() +
        $("#hideMarkers").width() +
        map.numZoomLevels * 27 +
        84,
    });
    $("#abrirSobre").css({
      left:
        $("#resetZoom").width() +
        $("#aboutBox").width() +
        $("#hideMarkers").width() +
        $("#slicer").width() +
        map.numZoomLevels * 27 +
        50,
    });
    $("#slicer").css({
      "margin-top": "5px",
    });
    $("#maisZoom").hide();
    $("#menosZoom").hide();
  }

  /* ******************* Iniciar no centro ****************/
  map.setCenter(new OpenLayers.LonLat(0, 0), 1);
  map.zoomToMaxExtent();

  /* ******************* Nível de zoom inicial (metade) ****************/

  map.setLayerZIndex("Zoomify", -100);
  map.setLayerZIndex("vector", -100);
}

//carrega junto com o index
$(document).ready(function (e) {
  var images = ["img/bt1.png", "img/bt2.png"];

  $(images).each(function () {
    var image = $("<img />").attr("src", this);
  });
  //função centraliza o boxs
  centralizaBox();
  //oculta a caixa sobre a imagem
  $("#caixaSobre").hide();

  var viewMarkers = true;
  //box recebe falso
  var box = false;
  //oculta o box da descrição
  $("#contentBox").hide();
  //oculta a referencia
  $("#box").hide();
  //base do analise de imagem
  $("#navBar").css({
    top: $("#map").height() - $("#navBar").height(),
    width: $("#map").width(),
  });

  /* Se for IE, não exibe a cor da barra de navegação */
  if (navigator.appVersion.indexOf("MSIE") !== -1) {
    $("#navBar").css({ "background-color": "none" });
  } else {
    $("#navBar").css({
      "background-color": "none",
      "background-position-y": "-5px",
    });
  }

  $("#hideMarker").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }
    if (viewMarkers === true) {
      $("#hideMarkers").css("background-image", "url(img/bt1.png)");
      selectFeature.unselectAll();
      selected = false;
      map.removeLayer(vectors);
      $("#contentBox").hide();
      box = false;
      viewMarkers = false;
    } else {
      $("#hideMarkers").css("background-image", "url(img/bt2.png)");
      map.addLayers([vectors]);
      viewMarkers = true;
    }
  });
  //abri o box com o titulo e descricao
  $("#showBox").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }
    //se o box for true
    if ($("#box").is(":visible")) {
      //oculta
      $(backgrounPopup).hide();
      //oculta-o
      $("#box").hide();
    } else {
      $("#contetAbout").animate({ scrollTop: 0 });
      //se for falso exibe o box
      $("#box").show();
      //exibe o testo
      $(backgrounPopup).show();
      //oculta a caixa sobre a imagem
      $("#caixaSobre").hide();
    }
  });
  //o botão close oculta o box
  $("#closeBoxDescreption").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }
    $("#contetGlyph").scrollTop(0);
    selectFeature.unselectAll();
    lb.options[lb.selectedIndex].selected = false;
    lb.options.selectedIndex = 0;
    $("#contentBox").hide();
  });
  //fecha o botao
  $("#close").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }

    $(backgrounPopup).hide();
    $("#box").hide();
  });

  $("#navBar").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }
  });

  $("#abrirSobre").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }
    if ($("#caixaSobre").is(":visible")) {
      $(backgrounPopup).hide();
      $("#caixaSobre").hide();
    } else {
      $("#conteudoSobre").animate({
        scrollTop: 0,
      });
      $(backgrounPopup).show();
      $("#caixaSobre").show("fast");
      $("#box").hide();
    }
  });
  //botao "i" manipulando os outro box
  $("#aboutBox").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }
    if ($("#box").is(":visible")) {
      $(backgrounPopup).hide();
      $("#caixaSobre").hide();
    } else {
      $("#contetAbout").animate({ scrollTop: 0 });
      $(backgrounPopup).show();
      $("#caixaSobre").show("fast");
    }
  });
  //fecha o botao do sobre a imagem
  $("#fecharSobre").click(function () {
    if (panZoomBar) {
      panZoomBar.redraw();
    }
    $(backgrounPopup).hide();
    $("#caixaSobre").hide();
  });
  //recebe do config o titulo do botão sobre a imagem "i"
  $("#tituloAbout").html(tituloAbout);
  //recebe o conteudo do botão "i"
  $("#contetAbout").html(conteudoAbout);
  //recebe o titulo do botao sobre a iamgem
  $("#tituloSobre").html(tituloCaixaSobre);
  //recebe o conteudo do botão sobre a imagem
  $("#conteudoSobre").html(conteudoCaixaSobre);
});

//movimento na tela
$(window).resize(function () {
  $("#navBar").css({ top: $("#map").height() - $("#navBar").height() });
  $("#navBar").css({ width: $("#map").width() });

  if (panZoomBar) {
    panZoomBar.redraw();
  }
  centralizaBox();
});

//abri o objeto do list menu
function selectMarker(obj) {
  //recebe a função dos navegadores mobile
  var navegador = isMobile();
  //faz o laço para limitar o nivel de zoom
  for (var i = 0; i < arr.length; i++) {
    //se for igual a do arquivo config o nivel de zoom aumenta ou diminui
    if (arr[i].id === obj) {
      //openlayres define o nivel de zoo,
      map.zoomTo(arr[i].nivelZoom);
    }
  }
  //oculta o poup
  $(backgrounPopup).hide();
  //posiciona o imagen
  setPosition(obj);

  selectFeature.unselectAll();

  lb = document.getElementById("comboMarkers");
  for (i = 0; i < vectors.features.length; i++) {
    if (obj === vectors.features[i].id) {
      selectFeature.select(vectors.features[i]);
      break;
    }
  }
  for (i = 0; i < lb.options.length; i++) {
    if (lb.options[i].value === obj) {
      lb.options[i].selected = true;
    }
  }

  ajustBoxes(obj);
}
//para o mobile remove e adiciona uma nova classe
$(function () {
  if (isMobile()) {
    $(".jump_menu_content").removeClass("jump_menu_content");
  }
});

//para mobile se estiver visivel oculta e deixa passar uns segundo exibe novamente para poder carregar o conteudo
if (isMobile()) {
  $(window).resize(function () {
    if ($("#caixaSobre").is(":visible")) {
      $("#caixaSobre").hide();
      setTimeout(function () {
        $("#caixaSobre").show("fast");
      }, 800);
    }

    if ($("#contentBox").is(":visible")) {
      $("#contentBox").hide();
      setTimeout(function () {
        $("#contentBox").show("fast");
      }, 800);
    }
  });
}

$(function () {
  //Criando o popup de background
  backgrounPopup = $("<div></div>")
    .css({
      opacity: 0.7,
      background: "#000",
      position: "absolute",
      height: $(window).height() - 50,
      width: "100%",
      top: 0,
      left: 0,
      zIndex: 9999,
    })
    .hide();

  $("body").append(backgrounPopup);
  $(window).resize(function () {
    $(backgrounPopup).css({
      height: $(window).height() - 50,
    });
  });
});
