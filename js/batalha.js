function BatalhaViewModel()
{
    var tabuleiro = this;
    this.imagemMorador = function(item) {
        return "url(imgs/"+item.morador+'.jpg)';
    }
    var totalPecasAMostrar = BOARD_SIZE * BOARD_SIZE;
    var pecasAVirar = [];

    var seq=0;
    function Carta(tab, morador) {
        var self = this;
        this.data = ko.observable("")
        this.morador = morador;
        var imgName = tab.imagemMorador(this);

        self.data(imgName)
        self.visivel = ko.observable(false)
        self.id="p"+(seq++);

        self.mostraCasa = function() {
            $("#"+self.id).disableTransitions();

            self.data(cacadorXpresa[self.morador].imagemCasa())
        }

        self.somMorador = function() {
            return cacadorXpresa[self.morador].audio;
        }

        this.revela = function() {
            if (self.visivel())
                return;

            self.visivel(true);
            tab.abriuBloco(self);
        }
    }

    function Linha() {
        this.colunas = ko.observableArray();
        this.adicionaColuna = function(celula) {
            this.colunas.push(celula)
        }
    }

    var cacadorXpresa = {
        "policia"          : new Cacador("policia","bandido","delegacia"),
        "bombeiro"         : new Cacador("bombeiro","incendio","estacao"),
        "ambulancia"       : new Cacador("ambulancia", "acidente","hospital"),
        "caminhao-de-lixo" : new Cacador("caminhao-de-lixo", "lixo","lixao")
    }
    var presas = _.map(cacadorXpresa, function(cacador) {
        return cacador.presa;
    })

    var numPresasDeCadaTipo = 2;
    var cartasDoJogo = [];
    this.problemas = ko.observableArray();

    Object.keys(cacadorXpresa).forEach(function(nomeCacador) {
        var j;
        for (j=0; j < numPresasDeCadaTipo; j++) {
            cartasDoJogo.push(new Carta(tabuleiro, nomeCacador));
            var nomeDaPresa = cacadorXpresa[nomeCacador].presa;
            cartasDoJogo.push(new Carta(tabuleiro, nomeDaPresa));
            tabuleiro.problemas.push(nomeDaPresa);
        }
    })

    var missing = (BOARD_SIZE*BOARD_SIZE) - cartasDoJogo.length;

    for (var j=0; j<missing; j++) {
        var n=Math.floor((Math.random() * 2) + 1);
        cartasDoJogo.push(new Carta(tabuleiro, "cidade"+n));
    }
    cartasDoJogo = _.shuffle(cartasDoJogo);

    this.linhas = ko.observableArray();
    var nLinha=-1;
    cartasDoJogo.forEach(function(carta) {
        nLinha=(nLinha+1)%BOARD_SIZE;
        if (nLinha == 0)
            tabuleiro.linhas.push(new Linha())
        _.last(tabuleiro.linhas()).adicionaColuna(carta);
    })

    var tempoParaOJogadorVerAsPecas = 8000;
    var tempoParaEvitarTransicaoDeBaixoParaCima = 400;
    setTimeout(function() {
        cartasDoJogo.forEach(function(carta) {
            carta.visivel(true);
        })

        var tempoDoRelogio_1segundo = 1000;
        setTimeout(function() {
            cartasDoJogo.forEach(function(carta) {
                carta.visivel(false);
            })
            var clockHandle = setInterval(function() {
                if (tabuleiro.ganhou()) {
                    clearInterval(clockHandle)
                    return;
                }
                tabuleiro.tempo_decorrido(tabuleiro.tempo_decorrido()+1);
            }, tempoDoRelogio_1segundo)
        }, tempoParaOJogadorVerAsPecas);
    }, tempoParaEvitarTransicaoDeBaixoParaCima);

    var ultimaPresa = null;

    function ocultaPecas() {
        var p = arguments
        setTimeout(function() {
            _.each(p,function(peca) {
                peca.visivel(false);
            });
        },1000)
    }

    this.blocos_abertos  = ko.observable(0);
    this.objetivo = ko.observable();
    this.tempo_decorrido = ko.observable(0);

    this.abriuBloco = function(pecaAberta) {
        this.blocos_abertos(this.blocos_abertos()+1)

        if (presas.contains(pecaAberta.morador)) {
            if (ultimaPresa) {
                ocultaPecas(ultimaPresa,pecaAberta);

                ultimaPresa = null;
                return;
            }
            ultimaPresa = pecaAberta;
            tabuleiro.procurandoCacador();
            return;
        }

        if (pecaAberta.morador in cacadorXpresa) {
            var capturado = false;
            if (ultimaPresa) {
                var presaDoCacador = cacadorXpresa[pecaAberta.morador].presa;
                if (presaDoCacador == ultimaPresa.morador) {
                    capturado = true;
                    tabuleiro.capture(ultimaPresa, pecaAberta);
                }
                else {
                    ocultaPecas(ultimaPresa);
                }
            }
            if (!capturado) {
                ocultaPecas(pecaAberta);
            }
        }
        else {
            if (ultimaPresa) {
                (function() {
                    var presa = ultimaPresa;
                    setTimeout(function () {
                        presa.visivel(false);
                    }, 1000)
                })()
            }
        }
        ultimaPresa = null;
    }

    this.capture = function(presa, cacador) {
        tabuleiro.ganhaPonto(ultimaPresa.morador);
        var cacadorCelula = $("#"+cacador.id)

        var cacadorAnimado = $(".chase")
        cacadorAnimado.show();

        cacadorAnimado.offset({
            top:  cacadorCelula.offset().top,
            left: cacadorCelula.offset().left
        });
        cacadorAnimado.width(cacadorCelula.width())
        cacadorAnimado.height(cacadorCelula.height())
        cacadorAnimado.css("background-image", tabuleiro.imagemMorador(cacador));
        cacador.mostraCasa();

        var pr = $("#"+presa.id)
        var som = cacador.somMorador();
        som.play();
        cacadorAnimado.animate({left: pr.offset().left},null,null, function()
        {
            cacadorAnimado.animate({top: pr.offset().top},null,null, function(){
                tabuleiro.procurandoBandido();
                pr.disableTransitions();
                pr.css("background-image", tabuleiro.imagemMorador(cacador));
                pr.append($("<img class='gotcha' src='../imgs/ok.png'>"));

                cacadorAnimado.hide();
                setTimeout(function() {
                    som.pause();
                    som.currentTime=0;
                },1000)
            });
        })
    }

    this.reiniciar = function() {
        window.location.reload()
    }

    this.ganhaPonto = function(problemaResolvido) {
        for(var index=0; index < tabuleiro.problemas().length; index++) {
            if (tabuleiro.problemas()[index] == problemaResolvido) {
                break;
            }
        }
        tabuleiro.problemas.splice(index,1);
    }

    this.ganhou = ko.pureComputed(function() {
        return tabuleiro.problemas().length == 0;
    })

    this.procurandoBandido = function() {
        tabuleiro.objetivo("Encontre um problema para resolver");
    }

    this.procurandoCacador = function() {
        tabuleiro.objetivo("Encontre alguém para resolver esse problema");
    }

    this.procurandoBandido();
}

$(function() {
    ko.applyBindings(new BatalhaViewModel());
})
