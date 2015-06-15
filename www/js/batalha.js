function BatalhaViewModel()
{
    var self = this;

    var cacadorXpresa = [
        new Cacador("policia",          "bandido",        "delegacia"),
        new Cacador("bombeiro",         "incendio",       "estacao"),
        new Cacador("ambulancia",       "acidente",       "hospital"),
        new Cacador("caminhao-de-lixo", "lixo",           "lixao"),
        new Cacador("onibus",           "passageiros",    "garagem"),
        new Cacador("guincho",          "carro-quebrado", "oficina")
    ]
    var clockHandle = null;
    this.linhas = ko.observableArray();
    this.problemas = ko.observableArray();
    this.blocos_abertos  = ko.observable(0);
    this.tempo_decorrido = ko.observable(0);
    this.jogando = ko.observable(false);

    this.iniciar = function() {
        self.jogando(false);
        self.linhas([])
        self.problemas([])
        self.blocos_abertos(0);
        self.tempo_decorrido(0);

        var numPresasDeCadaTipo = 1;
        var cartasDoJogo = [];
        clearInterval(clockHandle)

        cacadorXpresa.forEach(function(cacador) {
            for (var j=0; j < numPresasDeCadaTipo; j++) {
                cartasDoJogo.push(new Carta(self, cacador));
                var presa = cacador.presa;
                cartasDoJogo.push(new Carta(self,presa));
                self.problemas.push(presa.morador);
            }
        })

        var missing = (app.BOARD_SIZE * app.BOARD_SIZE) - cartasDoJogo.length;

        for (var j=0; j<missing; j++) {
            var n=Math.floor((Math.random() * 2) + 1);
            cartasDoJogo.push(new Carta(self, new Cidade("cidade"+n)));
        }
        cartasDoJogo = _.shuffle(cartasDoJogo);


        var nLinha=-1;
        cartasDoJogo.forEach(function(carta) {
            nLinha = (nLinha+1) % app.BOARD_SIZE;
            if (nLinha == 0)
                self.linhas.push(new Linha())
            _.last(self.linhas()).adicionaColuna(carta);
        })

        var tempoParaOJogadorVerAsPecas = 8000;
        var tempoParaEvitarTransicaoDeBaixoParaCima = 400;
        app.defer(function() {
            cartasDoJogo.forEach(function(carta) {
                carta.visivel(true);
            })

            var tempoDoRelogio_1segundo = 1000;
            app.defer(function() {
                cartasDoJogo.forEach(function(carta) {
                    carta.visivel(false);
                })
                clockHandle = setInterval(function() {
                    if (self.ganhou()) {
                        clearInterval(clockHandle)
                        return;
                    }
                    self.tempo_decorrido(self.tempo_decorrido()+1);
                }, tempoDoRelogio_1segundo)
            }, tempoParaOJogadorVerAsPecas);
        }, tempoParaEvitarTransicaoDeBaixoParaCima);
        self.jogando(true);
    }

    var ultimaPresaAberta = null;

    function ocultaPecas() {
        var p = arguments
        app.defer(function() {
            _.each(p,function(peca) {
                peca.visivel(false);
            });
        },1000)
    }

    this.abriuBloco = function(cartaAberta) {
        if (self.ganhou())
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
            return;
        }

        if (cartaAberta.morador.isCacador()) {
            var capturado = false;
            if (ultimaPresaAberta) {
                var presaDoCacador = cartaAberta.morador.presa;
                if (presaDoCacador == ultimaPresaAberta.morador) {
                    capturado = true;
                    self.capturar(ultimaPresaAberta, cartaAberta);
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
                    app.defer(function () {
                        presa.visivel(false);
                    }, 1000)
                })()
            }
        }
        ultimaPresaAberta = null;
    }

    this.capturar = function(presa, cartaCacador) {
        self.marcaPonto(ultimaPresaAberta.morador);
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

        var pr = $("#"+presa.id);
        var som = cacador.somMorador();
        app.play(som);
        cacadorAnimado.animate({left: pr.offset().left},null,null, function()
        {
            cacadorAnimado.animate({top: pr.offset().top},null,null, function(){
                pr.disableTransitions();
                pr.css("background-image", cacador.imagemMorador());
                pr.append($("<img class='gotcha' src='../imgs/ok.png'>"));

                cacadorAnimado.hide();
                app.defer(function() {
                    som.pause();
                    som.currentTime=0;
                },1000)
            });
        })
    }

    this.reiniciar = function() {
        self.iniciar();
    }

    this.marcaPonto = function(problemaResolvido) {
        for(var index=0; index < self.problemas().length; index++) {
            if (self.problemas()[index] == problemaResolvido.morador) {
                break;
            }
        }
        self.problemas.splice(index,1);
    }

    this.ganhou = ko.pureComputed(function() {
        return self.jogando() &&  self.problemas().length == 0;
    })

    self.iniciar();
}
var memoryChase = new BatalhaViewModel();
$(function() {
    ko.applyBindings(memoryChase);
})