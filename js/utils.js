jQuery.fn.extend({
   disableTransitions: function() {
       this.css({
           WebkitTransition : '',
           MozTransition    : '',
           MsTransition     : '',
           OTransition      : '',
           transition       : '',
       },"")
   }
});

Array.prototype.contains = function(what) {
    return this.indexOf(what)!=-1;
}