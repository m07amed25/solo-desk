import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createTranslator} from 'next-intl';
import {parse} from '@formatjs/icu-messageformat-parser';
import {presentation, isLocale, isTheme, isReturnPath, parsePreferences, normalizedAuthPath, callbackEntry, authFailure} from '../lib/site.ts';
const en = JSON.parse(readFileSync(new URL('../messages/en.json', import.meta.url)));
const ar = JSON.parse(readFileSync(new URL('../messages/ar.json', import.meta.url)));

test('finite presentation defaults and destination denials', () => {
  assert.deepEqual(presentation('ar', 'system'), {locale:'ar',theme:'system',dir:'rtl'});
  assert.deepEqual(presentation('../ar', 'auto'), {locale:'en',theme:'dark',dir:'ltr'});
  for(const bad of [undefined, null, '', '__proto__', '../ar', 'EN', 'ar/en']) assert.equal(isLocale(bad),false);
  for(const bad of ['auto', '__proto__',null]) assert.equal(isTheme(bad),false);
  for(const bad of ['https://evil.example','//evil.example','/app?x=1','/app#x','/app/','/\\evil.example','/%2f%2fevil.example']) assert.equal(isReturnPath(bad),false);
});
test('preferences accept precisely three bounded, unique fields', () => {
  assert.deepEqual(parsePreferences('locale=ar&theme=system&returnTo=%2Fapp'),{locale:'ar',theme:'system',returnTo:'/app'});
  for(const body of ['locale=en&locale=ar&theme=dark&returnTo=%2F','locale=en&theme=dark&returnTo=%2F&role=owner','locale=en&theme=auto&returnTo=%2F','locale=en&theme=dark&returnTo=//evil.example','locale=en&theme=dark','x'.repeat(2049), 'locale=ar&theme=light&returnTo=/app&returnTo=/']) assert.equal(parsePreferences(body),null);
});
test('auth errors discard arbitrary/duplicate fields and retain bounded entry', () => {
  assert.equal(normalizedAuthPath('sign-in',new URLSearchParams()),null);
  assert.equal(normalizedAuthPath('sign-up',new URLSearchParams('authError=1')),null);
  for(const q of ['authError=raw','error=secret','authError=1&error_description=secret','next=https://evil.example','authError=1&authError=1']) assert.equal(normalizedAuthPath('sign-up',new URLSearchParams(q)),'/sign-up?authError=1');
  assert.equal(callbackEntry(new URLSearchParams('entry=sign-up')),'sign-up');
  assert.equal(callbackEntry(new URLSearchParams('entry=sign-up&entry=sign-in')),'sign-in');
  assert.equal(callbackEntry(new URLSearchParams('entry=https://evil.example')),'sign-in');
  assert.equal(authFailure('sign-in'),'/sign-in?authError=1');
});
function leaves(value, prefix='') {
  return Object.entries(value).flatMap(([k,v])=>typeof v === 'string' ? [[`${prefix}${k}`,v]] : leaves(v,`${prefix}${k}.`));
}
function args(message) {
  const found=[];
  function visit(nodes) { for(const n of nodes) { if(n.type!==0 && n.value) found.push([n.value,n.type]); if(n.options) for(const option of Object.values(n.options)) visit(option.value); if(n.children) visit(n.children); } }
  visit(parse(message));return found.sort((a,b)=>a[0].localeCompare(b[0]));
}
test('English/Arabic catalogs match keys and ICU arguments; all messages format', async () => {
  const english=leaves(en), arabic=leaves(ar);
  assert.deepEqual(english.map(([key])=>key).sort(),arabic.map(([key])=>key).sort());
  const arabicMap=new Map(arabic);
  for(const [key,message] of english) assert.deepEqual(args(message),args(arabicMap.get(key)),key);
  await Promise.all(Array.from({length:20},async (_,i)=>{
    const locale=i%2?'ar':'en';const messages=locale==='ar'?ar:en;
    const t=createTranslator({locale,messages,onError(error){throw error;}});
    for(const [key] of english) assert.ok(t(key,{name:'Example',provider:'Google',hours:2,minutes:30,amount:1250,language:'العربية',current:'Dark',next:'Light'}));
    assert.equal(t('Navigation.signIn'),messages.Navigation.signIn);
    assert.notEqual(t('Navigation.signIn'),(locale==='ar'?en:ar).Navigation.signIn);
  }));
});
