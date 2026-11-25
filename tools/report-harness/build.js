const path=require('path');const esb=require(process.argv[2]);const P=process.argv[3];
const scss={name:'scss',setup(b){
 b.onResolve({filter:/\.scss$/},a=>{if(a.importer.includes('node_modules'))return;const f=path.resolve(a.resolveDir,a.path)+'.css';return {path:f,namespace:/\.module\.scss$/.test(a.path)?'mod':'glob'}});
 b.onLoad({filter:/.*/,namespace:'mod'},a=>({contents:require('fs').readFileSync(a.path,'utf8'),loader:'local-css',resolveDir:path.dirname(a.path)}));
 b.onLoad({filter:/.*/,namespace:'glob'},a=>({contents:require('fs').readFileSync(a.path,'utf8'),loader:'css',resolveDir:path.dirname(a.path)}));
 b.onResolve({filter:/^APP\//},a=>({path:require.resolve(P+'/lib/'+a.path.slice(4))}));
}};
esb.build({entryPoints:['entry.js'],bundle:true,outdir:'out',plugins:[scss],nodePaths:[P+'/node_modules'],loader:{'.png':'dataurl','.svg':'dataurl','.woff':'dataurl','.woff2':'dataurl','.xlsx':'file'},define:{'process.env.NODE_ENV':'"development"'},logLevel:'error',mainFields:['browser','module','main'],alias:{'@fluentui/react-charting':P+'/node_modules/@fluentui/react-charting/lib-commonjs/index.js'}}).then(()=>console.log('ok'),e=>{process.exit(1)});
