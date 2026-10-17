const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
test('calendar FR/EN catalogs have matching keys and interpolation fields',async()=>{
 const source=fs.readFileSync(path.join(root,'jpdbLocalization.js'),'utf8');
 const core=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const context={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'i18n.js'),'utf8'),context);
 assert.deepEqual(core.validateCatalogs(context.window.JPDB_CALENDAR_I18N),[]);
 assert.equal(core.translate(context.window.JPDB_CALENDAR_I18N,'en','manyResults',{count:25}),'25 activities found');
 assert.equal(core.translate(context.window.JPDB_CALENDAR_I18N,'fr','rangeLabel'),'Période');
});
