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
