import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir=path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root:path.resolve(rootDir,'pages-client'),
  base:'/adv-matos/',
  publicDir:path.resolve(rootDir,'public'),
  plugins:[react()],
  resolve:{alias:{'@':rootDir}},
  build:{outDir:path.resolve(rootDir,'dist-pages'),emptyOutDir:true,sourcemap:false},
});
