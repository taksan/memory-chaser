var app = new function() {
    var self=this;
    this.BOARD_SIZE = 5;
    this.isSfxEnabled = ko.observable(false);

    this.play = function(audio) {
        if (self.isSfxEnabled()) {
            audio.play();
        }
    }

    this.defer = function(fn, timeout) {
        return setTimeout(fn, timeout);
    }
};

function inicializaAjustesDinamicosDoDom() {
    $(function() {
        FastClick.attach(document.body);
    });
    document.addEventListener('deviceready', function() {
        FastClick.attach(document.body);
    }, false);

    $(function() {
        var tamPeca = 0;
        var padding = 10;
        var alturaMax= window.innerHeight -
            $(".painel-problemas").height() - $(".painel-score").height() - 64 - padding;

        var larguraMax= window.innerWidth - padding;
        if (alturaMax > larguraMax)
            tamPeca = larguraMax / app.BOARD_SIZE;
        else
            tamPeca = alturaMax / app.BOARD_SIZE;
        tamPeca -= 12;

        var msg = $(".mensagem");
        msg.offset({left: (window.innerWidth-msg.width())/2});
        msg.offset({top: ((app.BOARD_SIZE*tamPeca)-msg.height())/2});

        $(".celula").livequery(function() {
            $(this).css("display","inline-block");
            $(this).width(tamPeca);
            $(this).height(tamPeca);
        });

        $(".pedra").livequery(function() {
            $(this).width(tamPeca);
            $(this).height(tamPeca);
        });

        $(".gotcha").livequery(function() {
            $(this).css("max-width",tamPeca/3);
        })
    })
}
inicializaAjustesDinamicosDoDom();
