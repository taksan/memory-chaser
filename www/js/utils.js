jQuery.fn.extend({
   disableTransitions: function() {
       this.css({
           WebkitTransition : '',
           MozTransition    : '',
           MsTransition     : '',
           OTransition      : '',
           transition       : '',
       },"")
       return this;
   }
});

jQuery.fn.extend({
    transform: function(transformation) {
        this.css({
            WebkitTransform : transformation,
            MozTransform    : transformation,
            MsTransform     : transformation,
            OTransform      : transformation,
            transform       : transformation,
        },"")
        return this;
    }
});

jQuery.fn.extend({
    transition: function(transition) {
        this.css({
            WebkitTransition : transition,
            MozTransition    : transition,
            MsTransition     : transition,
            OTransition      : transition,
            transition       : transition,
        },"")
        return this;
    }
});



Array.prototype.contains = function(what) {
    return this.indexOf(what)!=-1;
}