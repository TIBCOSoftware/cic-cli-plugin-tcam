import path from 'path';
import generator from '../dist/codegen.js';

generator.generate({
  swagger: path.resolve(__dirname, 'swagger.yaml'),
  target_dir: path.resolve(__dirname, 'generated-with-swagger')
}, (err) => {
  if (err) console.log(err.message);
});
