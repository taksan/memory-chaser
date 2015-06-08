function BatalhaViewModel()
{
    const BOARD_SIZE = 5;
    function inicializaAjustesDinamicosDoDom() {
        $(function() {
            FastClick.attach(document.body);
        });
        var tamPeca = 0;
        $(".celula").livequery(function() {
            $(this).css("display","inline-block")
            $(this).width(tamPeca)
            $(this).height(tamPeca)
        })

        $(".pedra").livequery(function() {
            $(this).width(tamPeca)
            $(this).height(tamPeca)
        })

        $(".gotcha").livequery(function() {
            $(this).css("max-width",tamPeca/3);
        })

        $(function() {
            var padding = 10;
            var alturaMax= window.innerHeight -
                $(".painel-problemas").height() - $(".painel-score").height() - 64 - padding;

            var larguraMax= window.innerWidth - padding;
            if (alturaMax > larguraMax)
                tamPeca = larguraMax / BOARD_SIZE;
            else
                tamPeca = alturaMax / BOARD_SIZE;
            tamPeca -= 12;

            var msg = $(".mensagem");
            msg.offset({left: (window.innerWidth-msg.width())/2});
            msg.offset({top: ((BOARD_SIZE*tamPeca)-msg.height())/2});
        })
    }
    inicializaAjustesDinamicosDoDom();

    var tabuleiro = this;
    Array.prototype.contains = function(what) {
        return this.indexOf(what)!=-1;
    }

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

    var presas     = ["bandido","incendio","acidente"];
    var cacadorXpresa = {
        "policia" : new Cacador("policia","bandido","delegacia"),
        "bombeiro" : new Cacador("bombeiro","incendio","estacao"),
        "ambulancia" : new Cacador("ambulancia", "acidente","hospital")
    }

    var nPresas = 2;
    var flatTiles = [];
    this.problemas = ko.observableArray();

    var j;
    Object.keys(cacadorXpresa).forEach(function(nomeCacador) {
        for (j=0; j < nPresas; j++) {
            flatTiles.push(nomeCacador);
            flatTiles.push(cacadorXpresa[nomeCacador].presa);
            tabuleiro.problemas.push(cacadorXpresa[nomeCacador].presa);
        }
    })

    var missing = (BOARD_SIZE*BOARD_SIZE) - flatTiles.length;

    for (j=0; j<missing; j++) {
        var n=Math.floor((Math.random() * 2) + 1);
        flatTiles.push("cidade"+n);
    }
    flatTiles = _.shuffle(flatTiles);

    var grid=[];
    var linha;
    for(linha=0; linha < BOARD_SIZE; linha++) {
        grid[linha] = [];
        for(var coluna=0; coluna < BOARD_SIZE; coluna++) {
            grid[linha].push(flatTiles.pop());
        }
    }

    var numPresas = 0;
    grid.forEach(function(linha) {
        linha.forEach(function(morador) {
            if (presas.contains(morador))
                numPresas++;
        })
    })

    var ultimaPresa = null;

    var totalPecasAMostrar = BOARD_SIZE * BOARD_SIZE;
    var pecasAVirar = [];

    this.registraPeca = function(celula) {
        pecasAVirar.push(celula)
        var faltamPecas = pecasAVirar.length != totalPecasAMostrar;
        if (faltamPecas)
            return;

        var tempoParaOJogadorVerAsPecas = 8000;
        var tempoParaEvitarTransicaoDeBaixoParaCima = 400;
        setTimeout(function() {

            pecasAVirar.forEach(function(peca) {
                peca.visivel(true);
            })

            var tempoDoRelogio_1segundo = 1000;
            setTimeout(function() {
                pecasAVirar.forEach(function(peca) {
                    peca.visivel(false);
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
    }

    function ocultaPecas() {
        var p = arguments
        setTimeout(function() {
            _.each(p,function(peca) {
                peca.visivel(false);
            });
        },1000)
    }

    this.imagemMorador = function(item) {
        return "url(imgs/"+item.morador+'.jpg)';
    }

    function Celula(tab, col, linha) {
        var self = this;
        this.data = ko.observable("")
        this.morador = grid[linha][col];
        var imgName = tab.imagemMorador(this);

        self.data(imgName)
        self.visivel = ko.observable(false)
        self.id="p"+col+ "x"+linha;

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

    function Linha(tab, linha) {
        this.colunas = ko.observableArray();
        for(var coluna=0; coluna < BOARD_SIZE; coluna++) {
            var celula = new Celula(tab, coluna, linha);
            this.colunas.push(celula)
            tabuleiro.registraPeca(celula);
        }
    }

    this.linhas = ko.observableArray();
    this.blocos_abertos  = ko.observable(0);
    this.objetivo = ko.observable();
    this.tempo_decorrido = ko.observable(0);


    for(linha=0; linha < BOARD_SIZE; linha++)
        this.linhas.push(new Linha(tabuleiro,linha))

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
                pr.append($("<img class='gotcha' src='imgs/ok.png'>"));

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

/*
$(window).keydown(function(e) {
    var left = $(".chase")[0].offsetLeft;
    var top  = $(".chase")[0].offsetTop;
    var delta = 50;

    if (e.keyCode == 87) {//w
        $(".chase").offset({top: top-delta})
    }
    if (e.keyCode == 65) {//a
        $(".chase").offset({left: left-delta})
    }
    if (e.keyCode == 83) {//s
        $(".chase").offset({top: top+delta})
    }
    if (e.keyCode == 68) {//d
        $(".chase").offset({left: left+delta})
    }
})*/

ko.applyBindings(new BatalhaViewModel());
