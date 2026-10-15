// Bundles the web part's compiled React app (lib/) into one test page.
const esbuild=require('esbuild'),fs=require('fs'),path=require('path');
const R=require('path').resolve(__dirname,'..');
const css=fs.readFileSync(R+'/lib/webparts/edrmsReport/components/Report.module.scss.css','utf8').replace(/:global\s*\{/g,'{').replace(/:global\s*/g,'').replace(/:global\(([^)]*)\)/g,'$1');
const scssPlugin={name:'scss',setup(b){b.onResolve({filter:/\.module\.scss$/},a=>({path:a.path,namespace:'scss'}));b.onLoad({filter:/.*/,namespace:'scss'},()=>({contents:'export default {report:"report"}',loader:'js'}));}};
fs.mkdirSync(__dirname+'/out',{recursive:true});fs.writeFileSync(__dirname+'/out/entry.js',`import * as React from 'react';import * as ReactDom from 'react-dom';import {ReportApp} from '${R}/lib/webparts/edrmsReport/components/ReportApp.js';
const o=new URLSearchParams(location.search);ReactDom.render(React.createElement(ReportApp,{dashboard:o.get('d')||'bw',showSidebar:o.get('sb')!=='0',textSize:o.get('ts')||'large'}),document.getElementById('root'));`);
esbuild.build({entryPoints:[__dirname+'/out/entry.js'],bundle:true,outfile:__dirname+'/out/app.js',nodePaths:[R+'/node_modules'],plugins:[scssPlugin],loader:{'.json':'json'},define:{'process.env.NODE_ENV':'"development"'},logLevel:'error'}).then(()=>{
 // sass nests .report{...} then a block of plain rules: flatten by prefixing nothing (classes are unique enough for a test)
 fs.writeFileSync(__dirname+'/out/index.html','<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}'+css+'</style></head><body><div id="root"></div><script src="app.js"></script></body></html>');
 console.log('built');});
