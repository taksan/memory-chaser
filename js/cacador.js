function Cacador(nome, presa, casa) {
    this.morador = nome;
    this.presa = presa;
    this.casa = casa;

    this.imagemCasa = function() {
        return "url(imgs/"+this.casa+".jpg)";
    }

    this.somMorador = function() {
        return "sounds/" + this.morador + ".mp3";
    }

    this.audio = new Audio(this.somMorador())
}