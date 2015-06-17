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

    var cartaDaUltimaPresaAberta = null;

    function ocultaPecas() {
        var p = arguments
        app.defer(function() {
            _.each(p,function(peca) {
                peca.visivel(false);
            });
        },1000)
    }
    var somCartaVirando = new Audio("sounds/carta-virando.mp3");
    this.abriuBloco = function(cartaAberta) {
        if (self.ganhou())
            return;

        if (cartaAberta.visivel())
            return;

        cartaAberta.visivel(true);
        app.play(somCartaVirando);

        this.blocos_abertos(this.blocos_abertos() + 1)

        if (cartaAberta.morador.isPresa()) {
            if (cartaDaUltimaPresaAberta) {
                ocultaPecas(cartaDaUltimaPresaAberta, cartaAberta);

                cartaDaUltimaPresaAberta = null;
                return;
            }
            cartaDaUltimaPresaAberta = cartaAberta;
            return;
        }

        if (cartaAberta.morador.isCacador()) {
            var capturado = false;
            if (cartaDaUltimaPresaAberta) {
                var presaDoCacador = cartaAberta.morador.presa;
                if (presaDoCacador == cartaDaUltimaPresaAberta.morador) {
                    capturado = true;
                    self.capturar(cartaDaUltimaPresaAberta, cartaAberta);
                }
                else {
                    ocultaPecas(cartaDaUltimaPresaAberta);
                }
            }
            if (!capturado) {
                ocultaPecas(cartaAberta);
            }
        }
        else {
            if (cartaDaUltimaPresaAberta)
                cartaDaUltimaPresaAberta.oculta();
            cartaAberta.marcaAberta();
        }

        cartaDaUltimaPresaAberta = null;
    }

    this.capturar = function(presa, cartaCacador) {
        self.marcaPonto(cartaDaUltimaPresaAberta.morador);
        var cacadorCelula = $("#"+cartaCacador.id);

        var cacadorAnimado = $(".chase");
        cacadorAnimado.show();
        cacadorAnimado.offset({
            top:  cacadorCelula.offset().top,
            left: cacadorCelula.offset().left
        });
        cacadorAnimado.width(cacadorCelula.width());
        cacadorAnimado.height(cacadorCelula.height());

        var cacador = cartaCacador.morador;
        cacadorAnimado.css("background-image", cacador.imagemMorador());


        cartaCacador.mostraCasa();

        var posicaoDaPresa = $("#"+presa.id).parent().parent().offset();
        var som = cacador.somMorador();
        app.play(som);

        var xTranslation = posicaoDaPresa.left-cacadorCelula.offset().left;
        cacadorAnimado.addClass("chase-animation")
        cacadorAnimado.css("transform", "translate3d(" +xTranslation + "px,0,0)");
        cacadorAnimado.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
            function() {
                var yTranslation = posicaoDaPresa.top-cacadorCelula.offset().top;
                cacadorAnimado.css("transform", "translate3d(" +xTranslation + "px," +yTranslation + "px,0)");
                cacadorAnimado.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
                    function() {
                        cacadorAnimado.hide();
                        cacadorAnimado.removeClass("chase-animation");
                        cacadorAnimado.css("transform", "none");

                        presa.marcaCapturado(cacador);

                        app.defer(function() {
                            som.pause();
                            som.currentTime=0;
                        },1000)
                    })

            })


        //cacadorAnimado
        //    .velocity({left: posicaoDaPresa.left}, 800, "easeInQuad")
        //    .velocity({top:  posicaoDaPresa.top}, 800, "easeInQuad",
        //    function(){
        //        cacadorAnimado.hide();
        //        presa.marcaCapturado(cacador);
        //
        //        app.defer(function() {
        //            som.pause();
        //            som.currentTime=0;
        //        },1000)
        //    });
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