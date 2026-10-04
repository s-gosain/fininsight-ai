import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function silenceConsolePlugin() {
  return {
    name: 'silence-console-first',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        const script = `<script>
(function(){
  var n=function(){};
  var c=window.console||{};
  ['log','info','warn','debug','dir','table','trace','count','time','timeEnd','group','groupCollapsed','groupEnd','clear'].forEach(function(m){
    try{c[m]=n;Object.defineProperty(c,m,{value:n,writable:true,configurable:true});}catch(e){}
  });
})();
</script>`;
        return html.replace('<head>', `<head>${script}`);
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
