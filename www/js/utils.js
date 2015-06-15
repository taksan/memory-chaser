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

Array.prototype.contains = function(what) {
    return this.indexOf(what)!=-1;
}