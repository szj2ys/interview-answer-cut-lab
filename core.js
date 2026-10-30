(function (root) {
  'use strict';
  const CHECKS = ['ownership', 'numbers', 'limits', 'followup'];
  const KEYS = ['schema', 'question', 'source', 'cut', 'followups', 'pace', 'seconds', 'fictional', 'checks'];
  function blank() {
    return {schema: 1, question: '', source: '', cut: '', followups: '', pace: 130, seconds: 60,
      fictional: false, checks: Object.fromEntries(CHECKS.map(key => [key, false]))};
  }
  function words(text) {
    return (text.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) || []).length;
  }
  function numbers(text) {
    return [...new Set(text.match(/[+-]?\d+(?:[.,]\d+)*(?:%|[x×])?/g) || [])];
  }
  function analyze(state) {
    const sourceWords = words(state.source);
    const cutWords = words(state.cut);
    const sourceNumbers = new Set(numbers(state.source));
    return {sourceWords, cutWords, budgetWords: Math.floor(state.pace * state.seconds / 60),
      estimatedSeconds: Math.ceil(cutWords / state.pace * 60),
      newNumbers: numbers(state.cut).filter(value => !sourceNumbers.has(value))};
  }
  function validate(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        Object.keys(value).length !== KEYS.length || KEYS.some(key => !Object.hasOwn(value, key))) {
      throw new Error('This is not an Answer Cut Lab practice file.');
    }
    if (value.schema !== 1) throw new Error('Unsupported practice-file version.');
    for (const key of ['question', 'source', 'cut', 'followups']) {
      const max = key === 'question' ? 500 : 20000;
      if (typeof value[key] !== 'string' || value[key].length > max) {
        throw new Error('A text field is missing or too long.');
      }
    }
    if (!Number.isFinite(value.pace) || value.pace < 60 || value.pace > 220 ||
        ![30, 60, 90, 120].includes(value.seconds) || typeof value.fictional !== 'boolean') {
      throw new Error('The pace, target length or example label is invalid.');
    }
    if (!value.checks || typeof value.checks !== 'object' || Array.isArray(value.checks) ||
        Object.keys(value.checks).length !== CHECKS.length ||
        CHECKS.some(key => !Object.hasOwn(value.checks, key) || typeof value.checks[key] !== 'boolean')) {
      throw new Error('The review checklist is invalid.');
    }
    return {...value, checks: {...value.checks}};
  }
  function moveSelection(cut, followups, start, end) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > cut.length || start >= end) {
      throw new Error('Select some text in the shorter answer first.');
    }
    const selected = cut.slice(start, end).trim();
    if (!selected) throw new Error('Select words, rather than only spaces.');
    return {cut: cut.slice(0, start) + cut.slice(end),
      followups: followups + (followups ? '\n\n' : '') + selected};
  }
  function markdown(state) {
    validate(state);
    const stats = analyze(state);
    function section(title, text) {
      const tick = String.fromCharCode(96);
      const runs = text.match(new RegExp(tick + '+', 'g')) || [];
      const fence = tick.repeat(Math.max(3, ...runs.map(run => run.length + 1)));
      return '## ' + title + '\n\n' + fence + 'text\n' + text + '\n' + fence + '\n';
    }
    const labels = {ownership: 'Personal contribution is distinguished from team work.',
      numbers: 'Numbers and causal claims were checked against what I know.',
      limits: 'Uncertainty and missing evidence remain visible.',
      followup: 'I can explain the parked details if asked.'};
    return '# Answer Cut Lab practice\n\n' +
      (state.fictional ? 'FICTIONAL PRACTICE EXAMPLE — not personal experience.\n\n' : 'User-entered practice notes; not independently verified.\n\n') +
      section('Question', state.question) + '\n' + section('Original answer', state.source) + '\n' +
      section('Shorter answer', state.cut) + '\n' + section('Details for follow-ups', state.followups) +
      '\n## Editing measurements\n\n' + stats.sourceWords + ' source words; ' + stats.cutWords +
      ' shorter-answer words. Target: ' + state.seconds + ' seconds at an assumed ' + state.pace +
      ' words/minute. Approximate duration: ' + stats.estimatedSeconds + ' seconds. Pauses are not modeled.\n\n' +
      'New numeric strings: ' + (stats.newNumbers.join(', ') || 'none spotted') +
      '. This checks digit-written tokens only, not truth, units, meaning or spelled-out numbers.\n\n## Manual review\n\n' +
      CHECKS.map(key => '- [' + (state.checks[key] ? 'x' : ' ') + '] ' + labels[key]).join('\n') +
      '\n\nCreated with Answer Cut Lab. No hiring, language-level or factual validation is implied.\n';
  }
  const api = {CHECKS, blank, words, numbers, analyze, validate, moveSelection, markdown};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AnswerCut = api;
})(globalThis);

