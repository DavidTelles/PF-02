// Mock mínimo de DOM/window/document para rodar o script fora do navegador
global.window = global;
global.window.addEventListener = function(){};
global.document = {
  readyState: 'complete',
  visibilityState: 'visible',
  addEventListener: function(){},
  getElementById: function(id){
    if (id === 'hydra-bg') {
      return { appendChild: function(){} };
    }
    return null;
  }
};
global.matchMedia = function(){ return { matches: false }; };
global.requestAnimationFrame = function(cb){ /* não chama, evita loop infinito no teste */ return 1; };
global.cancelAnimationFrame = function(){};
global.innerWidth = 1280;
global.innerHeight = 800;
global.devicePixelRatio = 1;
global.pageYOffset = 0;
global.scrollY = 0;
global.document.documentElement = { scrollHeight: 3000, scrollTop: 0 };