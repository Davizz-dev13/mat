/* M.A.T · Estadísticas anónimas con GoatCounter (sin cookies). Cuenta también las rutas #/… del SPA. Nunca lanza errores. */
(function(){try{
  function p(){try{var h=(location.hash||'').slice(1).split('?')[0];return h||location.pathname||'/';}catch(e){return '/';}}
  var g=window.goatcounter=window.goatcounter||{};
  g.path=function(){return p();};
  var last=p();
  window.addEventListener('hashchange',function(){try{var q=p();if(q===last)return;last=q;if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:q});}catch(e){}});
}catch(e){}})();
