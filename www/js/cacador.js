function Cacador(nome, presa, casa) {
    var self = this;

    this.morador = nome;
    this.presa = new Presa(presa);
    this.casa = casa;

    this.imagemCasa = function() {
        return "url(imgs/"+self.casa+".jpg)";
    }

    this.somMorador = function() {
        return self.audio;
    }

    this.imagemMorador = function() {
        return "url(imgs/"+self.morador+'.jpg)';
    }

    this.isPresa = function() {
        return false;
    }

    this.isCacador = function() {
        return true;
    }

    this.audio = new Audio("sounds/" + self.morador + ".mp3")
}

function Presa(nome) {
    var self = this;
    this.morador = nome;

    this.imagemMorador = function() {
        return "url(imgs/"+self.morador+'.jpg)';
    }

    this.isPresa = function() {
        return true;
    }

    this.isCacador = function() {
        return false;
    }
}

function Cidade(nome) {
    var self = this;
    this.morador = nome;

    this.imagemMorador = function() {
        return "url(imgs/"+self.morador+'.jpg)';
    }

    this.isPresa = function() {
        return false;
    }

    this.isCacador = function() {
        return false;
    }
}