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