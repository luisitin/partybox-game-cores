import assert from 'node:assert/strict';

// Observe the ordinary trusted click. Host time can be rebased after reload,
// so native event timestamps are retained only as diagnostics, never compared
// with the host epoch. No clock, timer, state or RNG is overridden.
export async function observeClockClick(page,selector) {
  await page.evaluate(selector=>{
    const button=document.querySelector(selector);
    if(!button)throw new Error('Missing real clock control '+selector);
    const record={selector};window.__G07ClockObservation=record;
    button.addEventListener('click',event=>{
      record.eventTrusted=event.isTrusted;
      record.clickHostBefore=window.__G07.time();
      record.nativeBeforeMs=performance.now();
      record.nativeEventTimeStampMs=event.timeStamp;
    },{capture:true,once:true});
    // The game's existing onclick was installed before this observer.
    button.addEventListener('click',()=>{
      record.clickHostAfter=window.__G07.time();
      record.nativeAfterMs=performance.now();
      record.stateJson=JSON.stringify(window.__G07.state());
    },{once:true});
  },selector);
  await page.locator(selector).click();
  const record=await page.evaluate(()=>window.__G07ClockObservation);
  assert.equal(record.eventTrusted,true,'must observe the ordinary trusted Resume click');
  assert.equal(record.selector,selector);
  for(const key of ['clickHostBefore','clickHostAfter','nativeBeforeMs','nativeAfterMs','nativeEventTimeStampMs'])assert(Number.isFinite(record[key])&&record[key]>=0,'actual clock '+key);
  assert(record.clickHostAfter>=record.clickHostBefore&&record.nativeAfterMs>=record.nativeBeforeMs);
  const state=JSON.parse(record.stateJson);assert(state,'Resume must expose the actual resumed state');
  delete record.stateJson;
  return {record,state};
}
