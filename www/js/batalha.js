function BatalhaViewModel()
{
    var tabuleiro = this;

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

    var cacadorXpresa = [
        new Cacador("policia",          "bandido",  "delegacia"),
        new Cacador("bombeiro",         "incendio", "estacao"),
        new Cacador("ambulancia",       "acidente", "hospital"),
        new Cacador("caminhao-de-lixo", "lixo",     "lixao")
    ]

    var numPresasDeCadaTipo = 2;
    var cartasDoJogo = [];
    this.problemas = ko.observableArray();

    cacadorXpresa.forEach(function(cacador) {
        new Image(cacador.nomeImagemMorador());
        new Image(cacador.presa.nomeImagemMorador());

        var j;
        for (j=0; j < numPresasDeCadaTipo; j++) {
            cartasDoJogo.push(new Carta(tabuleiro, cacador));
            var presa = cacador.presa;
            cartasDoJogo.push(new Carta(tabuleiro,presa));
            tabuleiro.problemas.push(presa.morador);
        }
    })

    var missing = (BOARD_SIZE*BOARD_SIZE) - cartasDoJogo.length;

    for (var j=0; j<missing; j++) {
        var n=Math.floor((Math.random() * 2) + 1);
        cartasDoJogo.push(new Carta(tabuleiro, new Cidade("cidade"+n)));
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

    var ultimaPresaAberta = null;

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

    this.abriuBloco = function(cartaAberta) {
        if (tabuleiro.ganhou())
            return;

        if (cartaAberta.visivel())
            return;

        cartaAberta.visivel(true);

        this.blocos_abertos(this.blocos_abertos()+1)

        if (cartaAberta.morador.isPresa()) {
            if (ultimaPresaAberta) {
                ocultaPecas(ultimaPresaAberta, cartaAberta);

                ultimaPresaAberta = null;
                return;
            }
            ultimaPresaAberta = cartaAberta;
            tabuleiro.procurandoCacador();
            return;
        }

        if (cartaAberta.morador.isCacador()) {
            var capturado = false;
            if (ultimaPresaAberta) {
                var presaDoCacador = cartaAberta.morador.presa;
                if (presaDoCacador == ultimaPresaAberta.morador) {
                    capturado = true;
                    tabuleiro.capturar(ultimaPresaAberta, cartaAberta);
                }
                else {
                    ocultaPecas(ultimaPresaAberta);
                }
            }
            if (!capturado) {
                ocultaPecas(cartaAberta);
            }
        }
        else {
            if (ultimaPresaAberta) {
                (function() {
                    var presa = ultimaPresaAberta;
                    setTimeout(function () {
                        presa.visivel(false);
                    }, 1000)
                })()
            }
        }
        ultimaPresaAberta = null;
    }

    this.capturar = function(presa, cartaCacador) {
        tabuleiro.marcaPonto(ultimaPresaAberta.morador);
        var cacadorCelula = $("#"+cartaCacador.id)

        var cacadorAnimado = $(".chase")
        cacadorAnimado.show();

        cacadorAnimado.offset({
            top:  cacadorCelula.offset().top,
            left: cacadorCelula.offset().left
        });
        cacadorAnimado.width(cacadorCelula.width())
        cacadorAnimado.height(cacadorCelula.height())

        var cacador = cartaCacador.morador;
        cacadorAnimado.css("background-image", cacador.imagemMorador());
        cartaCacador.mostraCasa();

        var pr = $("#"+presa.id)
        var som = cacador.somMorador();
        som.play();
        cacadorAnimado.animate({left: pr.offset().left},null,null, function()
        {
            cacadorAnimado.animate({top: pr.offset().top},null,null, function(){
                tabuleiro.procurandoBandido();
                pr.disableTransitions();
                pr.css("background-image", cacador.imagemMorador());
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

    this.marcaPonto = function(problemaResolvido) {
        for(var index=0; index < tabuleiro.problemas().length; index++) {
            if (tabuleiro.problemas()[index] == problemaResolvido.morador) {
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
