function Morador(nome, ext) {
    var self=this;
    this.morador = nome;
    if (typeof ext == 'undefined')
        ext = "jpg";

    this.imagemMorador = function() {
        return "url("+ self.nomeImagemMorador() + ")";
    }

    this.nomeImagemMorador = function() {
        return "imgs/"+nome+"." + ext;
    }

    this.isPresa = function() {
        return false;
    }

    this.isCacador = function() {
        return false;
    }
    new Image().src=self.nomeImagemMorador();//preload image
}

function Cacador(nome, presa, casa) {
    var self = this;
    $.extend(self, new Morador(nome, "png"));

    this.presa = new Presa(presa);
    this.casa = casa;

    this.imagemCasa = function() {
        return "url(imgs/"+self.casa+".jpg)";
    }

    this.somMorador = function() {
        return self.audio;
    }

    this.isCacador = function() {
        return true;
    }

    this.audio = new Audio("sounds/" + self.morador + ".mp3")
}

function Presa(nome) {
    var self = this;
    $.extend(self, new Morador(nome))

    this.isPresa = function() {
        return true;
    }
}

function Cidade(nome) {
    var self = this;
    $.extend(self, new Morador(nome))
}