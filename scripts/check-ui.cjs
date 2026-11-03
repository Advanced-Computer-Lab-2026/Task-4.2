// State and interaction checks with simulated hooks, image decoding and storage.
// Browser layout, effects and native file dialogs require a manual browser check.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transformSync } = require('esbuild');
let state=[], cursor=0, current, storage=new Map(), failStorage=false;
const React={
 createElement(type,props,...children){return {type,props:props||{},children:children.flat(Infinity)};},
 useState(init){const i=cursor++;if(!(i in state))state[i]=typeof init==='function'?init():init;return [state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];},
 useRef(init){const i=cursor++;return state[i]??(state[i]={current:init});},
 useEffect(){}, useMemo(fn){return fn();}
};
const context={module:{exports:{}},exports:{},require:()=>React,console,Date,Promise,
 localStorage:{getItem:k=>storage.get(k)||null,setItem(k,v){if(failStorage)throw Error('quota');storage.set(k,v);}},
 document:{getElementById:()=>({scrollIntoView(){}}),createElement:()=>({getContext:()=>({fillRect(){},drawImage(){}}),toDataURL:()=> 'data:image/jpeg;base64,'+ ++current})},
 createImageBitmap:async file=>{if(file.bad)throw Error('bad');return {width:2000,height:1000,close(){}};}
};
context.exports=context.module.exports;current=0;
vm.runInNewContext(transformSync(fs.readFileSync('src/App.jsx','utf8'),{loader:'jsx',format:'cjs'}).code,context);
const App=context.module.exports.default;
function render(){cursor=0;return App();}
function all(n,p,out=[]){if(!n||typeof n!=='object')return out;if(p(n))out.push(n);for(const c of n.children||[])all(c,p,out);return out;}
function text(n){return (typeof n==='string'||typeof n==='number')?String(n):(n?.children||[]).map(text).join('');}
function find(p){const n=all(render(),p)[0];assert.ok(n,'Expected control');return n;}
function button(label){return find(n=>n.type==='button'&&text(n).replace(/\s/g,'')===label.replace(/\s/g,''));}
function labelInput(label){return find(n=>n.type==='label'&&text(n).startsWith(label)).children.find(n=>n?.type==='input');}
function articles(){return all(render(),n=>n.type==='article');}
function click(label){button(label).props.onClick();}
function close(){find(n=>n.props['aria-label']==='Close listing form').props.onClick();}
async function upload(label,files){await find(n=>n.type==='input'&&n.props['aria-label']===label).props.onChange({target:{files,value:'x'}});}
function photos(){return all(render(),n=>n.props.className==='photo-preview');}
function submit(){find(n=>n.type==='form').props.onSubmit({preventDefault(){}});}
(async()=>{
 assert.equal(articles().length,8);
 click('My listings');assert.equal(articles().length,3);
 click('Textbooks');assert.equal(articles().length,2);
 click('Browse items');assert.equal(articles().length,8);
 // Budget ranges include their endpoints and combine with category/search.
 function budget(id,value){find(n=>n.props.id===id).props.onChange({target:{value}});}
 function count(value){assert.equal(articles().length,value);assert.ok(text(find(n=>n.props.className==='filter-summary')).startsWith(value+' matching'));}
 budget('max-price','320');count(5);
 budget('min-price','140');count(5);
 budget('min-price','320');count(1);
 assert.match(text(find(n=>n.props.className==='filter-summary')),/1 matching listingClear/);
 budget('min-price','321');count(0);assert.match(text(render()),/Minimum price must/);
 budget('min-price','-1');count(0);assert.match(text(render()),/zero or more/);
 click('Clear filters');count(8);assert.equal(button('Clear filters').props.disabled,true);
 budget('max-price','0');count(0);
 budget('max-price','');budget('min-price','650');count(2);
 click('Clear filters');budget('max-price','320');click('Textbooks');count(2);
 find(n=>n.props['aria-label']==='Search listings').props.onChange({target:{value:'Calculus'}});count(1);
 find(n=>n.type==='select'&&n.props.value==='featured').props.onChange({target:{value:'high'}});
 click('Clear filters');count(8);assert.equal(find(n=>n.props.id==='max-price').props.value,'');
 budget('max-price','200');click('My listings');count(3);assert.equal(find(n=>n.props.id==='max-price').props.value,'');
 budget('max-price','200');count(2);click('Clear filters');count(3);
 click('Browse items');count(8);
 // Editing starts with existing photos; cancel preserves saved originals.
 click('My listings');click('Edit listing↗');assert.equal(photos().length,2);
 find(n=>n.props['aria-label']==='Remove photo 1').props.onClick();assert.equal(photos().length,1);
 click('Cancel');click('Edit listing↗');assert.equal(photos().length,2);
 const original=photos()[1].children[0].props.src;
 click('Make cover photo 2');assert.equal(photos()[0].children[0].props.src,original);
 await upload('Replace photo 1',[{type:'image/png',size:100}]);
 assert.ok(photos()[0].children[0].props.src.startsWith('data:'));
 await upload('Add photos',[{type:'image/webp',size:200}]);assert.equal(photos().length,3);
 submit();assert.equal(all(render(),n=>n.type==='form').length,0);
 const saved=JSON.parse(storage.get('acl-marketplace-v3'));assert.equal(saved[0].photos.length,3);
 click('Edit listing↗');assert.equal(photos().length,3);
 // Validation is atomic: bad files do not change draft photos.
 await upload('Add photos',[{type:'text/plain',size:5}]);assert.match(text(render()),/Choose a JPG/);assert.equal(photos().length,3);
 await upload('Add photos',[{type:'image/png',size:11*1024*1024}]);assert.match(text(render()),/10 MB or smaller/);
 await upload('Add photos',[{type:'image/png',size:10,bad:true}]);assert.match(text(render()),/could not be opened/);
 await upload('Add photos',Array.from({length:4},()=>({type:'image/png',size:10})));assert.match(text(render()),/up to 6 photos/);
 // Storage failure keeps the editor and draft open.
 failStorage=true;submit();assert.equal(all(render(),n=>n.type==='form').length,1);assert.match(text(render()),/not enough browser storage/);failStorage=false;
 // Removing all photos persists, rather than restoring old photos.
 while(photos().length)find(n=>n.props['aria-label']==='Remove photo 1').props.onClick();submit();
 assert.equal(JSON.parse(storage.get('acl-marketplace-v3'))[0].photos.length,0);
 click('+ Sell an item');await upload('Add photos',[{type:'image/jpeg',size:100}]);
 labelInput('Item title').props.onChange({target:{value:'New campus item'}});
 labelInput('Price').props.onChange({target:{value:'99'}});
 for(const [label,value] of [['Category','other'],['Condition','used']])find(n=>n.type==='label'&&text(n).startsWith(label)).children.find(n=>n?.type==='select').props.onChange({target:{value}});
 submit();assert.equal(JSON.parse(storage.get('acl-marketplace-v3'))[0].photos.length,1);
 assert.equal(JSON.parse(storage.get('acl-marketplace-v3'))[0].title,'New campus item');
 // Reload reads photos from saved browser data.
 state=[];assert.equal(articles().length,9);
 console.log('Passed: budget boundaries, combined filters, result counts, invalid ranges, clear filters, navigation, ownership, edit/cancel, cover selection, replace/add/remove, upload validation, storage errors, posting and reload persistence.');
})().catch(err=>{console.error(err);process.exitCode=1;});


