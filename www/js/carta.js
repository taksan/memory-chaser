var seq=0;
function Carta(tab, morador) {
    var self = this;
    this.imagemAtual = ko.observable("")
    this.morador = morador;
    var imgName = morador.imagemMorador();

    self.imagemAtual(imgName)
    self.visivel = ko.observable(false)
    self.id="p"+(seq++);

    self.mostraCasa = function() {
        $("#"+self.id).disableTransitions();
        self.imagemAtual(self.morador.imagemCasa())
        self.marcaAberta();
    }

    self.marcaCapturado = function(cacador) {
        var pr = $("#"+self.id)
        pr.disableTransitions();
        pr.css("background-image", cacador.imagemMorador());
        //pr.append($("<img class='gotcha' src='../imgs/ok.png'>"));
        pr.css("opacity", "0.5");
        var $img = $("<img class='gotcha' src='../imgs/ok.png'>");
        $img.offset(pr.offset())
        $("body").append($img)
    }

    self.marcaAberta = function() {
        app.defer(function() {
            $("#"+self.id).disableTransitions().css("opacity", "0.5");
        },500)

    }

    self.oculta = function() {
        app.defer(function () {
            self.visivel(false);
        }, 1000)
    }

    this.revela = function() {
        tab.abriuBloco(self);
    }
}

function Linha() {
    this.colunas = ko.observableArray();
    this.adicionaColuna = function(celula) {
        this.colunas.push(celula)
    }
}