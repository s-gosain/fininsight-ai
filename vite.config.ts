import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function silenceConsolePlugin() {
  return {
    name: 'silence-console-first',
    transformIndexHtml: {
      order: 'pre' as const,
      handler() {
        return [
          {
            tag: 'script',
            attrs: { type: 'text/javascript' },
            children: `(function(){
  var noop = function(){};
  var c = window.console;
  if (!c) return;
  var _nativeClear = typeof c.clear === 'function' ? c.clear.bind(c) : noop;
  ['log','info','warn','debug','dir','table','trace','count','time','timeEnd','group','groupCollapsed','groupEnd'].forEach(function(m){
    try {
      Object.defineProperty(c, m, {
        get: function(){ return noop; },
        set: function(){},
        configurable: false
      });
    } catch(e) {
      try { c[m] = noop; } catch(_) {}
    }
  });
  try {
    Object.defineProperty(c, 'clear', {
      get: function(){ return _nativeClear; },
      set: function(){},
      configurable: false
    });
  } catch(e) {}
  try { _nativeClear(); } catch(e) {}
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
      try { _nativeClear(); } catch(e) {}
    });
    setTimeout(function() {
      try { _nativeClear(); } catch(e) {}
    }, 150);
    setTimeout(function() {
      try { _nativeClear(); } catch(e) {}
    }, 600);
  }
})();`,
            injectTo: 'head-prepend' as const,
          },
        ];
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [silenceConsolePlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        host: '0.0.0.0',
        port: 3000,
        clientPort: 3000,
      },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
