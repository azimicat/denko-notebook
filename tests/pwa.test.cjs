const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const docs=path.join(__dirname,'..','docs');
const manifest=JSON.parse(fs.readFileSync(path.join(docs,'manifest.webmanifest'),'utf8'));
const pngSize=file=>{const b=fs.readFileSync(path.join(docs,file));return [b.readUInt32BE(16),b.readUInt32BE(20)].join('x');};
test('ホーム画面に追加したとき、ブラウザの枠なしで「電工ノート」として開く設定になっている',()=>{assert.equal(manifest.short_name,'電工ノート');assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'./#home');assert.equal(manifest.scope,'./');});
test('manifest に書いたアイコン画像がすべてあり、書いた大きさと画像の実際の大きさが一致する',()=>{for(const icon of manifest.icons)assert.equal(pngSize(icon.src),icon.sizes,icon.src);});
test('Androidのインストール条件になる 192px と 512px のアイコン、マスク用のアイコンがそろっている',()=>{const sizes=new Set(manifest.icons.map(i=>i.sizes));assert.ok(sizes.has('192x192'));assert.ok(sizes.has('512x512'));assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));});
test('オフライン用に端末へ保存するファイルが、すべて docs にある',()=>{
 // Service Worker の install 処理だけを取り出すため、self と caches を最小限の偽物に置き換える。保存しようとしたファイル名の一覧を確かめるのが目的。
 const handlers={};const added=[];
 const context=vm.createContext({self:{addEventListener:(name,fn)=>{handlers[name]=fn;},skipWaiting:()=>Promise.resolve()},caches:{open:()=>Promise.resolve({addAll:files=>{added.push(...files);return Promise.resolve();}})}});
 vm.runInContext(fs.readFileSync(path.join(docs,'sw.js'),'utf8'),context);
 handlers.install({waitUntil:()=>{}});
 return Promise.resolve().then(()=>{assert.ok(added.length>0);for(const file of added)assert.ok(fs.existsSync(path.join(docs,file==='./'?'index.html':file)),file);});
});
