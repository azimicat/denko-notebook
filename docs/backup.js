const StudyBackup = (() => {
 const format = 'denko-study-backup';
 const maxBytes = 2 * 1024 * 1024;
 const modes = new Set(['すべて','復習',...genres.map(g => g.name)]);
 const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
 const integer = v => Number.isSafeInteger(v) && v >= 0 && v <= 1000000000;
 function validate(data) {
  const invalid = () => { throw new Error('学習記録の内容を読み取れませんでした。電工ノートからダウンロードしたJSONファイルを選んでください。'); };
  if (!object(data) || !object(data.answers) || !Array.isArray(data.history) || data.history.length > 50) invalid();
  const ids = new Set(questions.map(q => q.id));
  const answers = {};
  for (const [id,a] of Object.entries(data.answers)) {
   if (!ids.has(id) || !object(a) || !integer(a.count) || a.count < 1 || !integer(a.correct) || a.correct > a.count || typeof a.last !== 'boolean' || typeof a.wrong !== 'boolean' || a.last === a.wrong) invalid();
   answers[id] = {count:a.count,correct:a.correct,last:a.last,wrong:a.wrong};
  }
  const history = data.history.map(h => {
   if (!object(h) || typeof h.date !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(h.date) || !Number.isFinite(Date.parse(h.date)) || !modes.has(h.mode) || !integer(h.count) || h.count < 1 || h.count > 10 || !integer(h.score) || h.score > h.count) invalid();
   return {date:new Date(h.date).toISOString(),mode:h.mode,score:h.score,count:h.count};
  });
  return {answers,history};
 }
 function parse(text) {
  let file;
  try { file = JSON.parse(text); } catch { throw new Error('JSONファイルを読み取れませんでした。ファイルが壊れていないか確認してください。'); }
  if (!object(file) || file.format !== format) throw new Error('電工ノートのバックアップファイルではありません。');
  if (file.version !== 1) throw new Error('このバックアップのバージョンには対応していません。');
  return validate(file.data);
 }
 function serialize(data) { return JSON.stringify({format,version:1,exportedAt:new Date().toISOString(),data:validate(data)},null,2); }
 return {maxBytes,validate,parse,serialize};
})();
