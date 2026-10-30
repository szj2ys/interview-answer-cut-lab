(function () {
  'use strict';
  const C = window.AnswerCut;
  const $ = id => document.getElementById(id);
  const textFields = ['question', 'source', 'cut', 'followups'];
  const example = {
    schema: 1,
    question: 'Tell me about a time you made a process easier.',
    source: 'In a student volunteering project, I helped organise a weekly equipment collection. Instructions were scattered across a long group message, and new volunteers often asked which items to bring. I was responsible for preparing the collection list, while another volunteer assigned people to locations. I put the item names and collection points into a short checklist and asked 2 volunteers to try it before the next collection. They each found an unclear label, which I changed. During that next collection, I recorded 12 requests for clarification. We had not counted requests before the checklist, so I cannot say it reduced them. What I can say is that we now had one shared list and a way to record questions for the next revision.',
    cut: 'I prepared the collection list for a student volunteering project. I turned scattered instructions into a short checklist and tested it with 2 volunteers. I fixed the unclear labels they found. We then had one shared list and recorded 12 clarification requests to guide the next revision. We had no earlier count, so I cannot claim a reduction.',
    followups: 'Another volunteer assigned people to locations; that was not my responsibility.\n\nThe trial found unclear labels, not proof of a faster collection.',
    pace: 130, seconds: 60, fictional: true,
    checks: {ownership: false, numbers: false, limits: false, followup: false}
  };
  function announce(message, error) {
    $('status').textContent = message;
    $('status').classList.toggle('error', !!error);
  }
  function state() {
    const value = C.blank();
    textFields.forEach(key => { value[key] = $(key).value; });
    value.pace = Number($('pace').value);
    value.seconds = Number($('seconds').value);
    value.fictional = $('fictional').checked;
    C.CHECKS.forEach(key => { value.checks[key] = document.querySelector('[data-check="' + key + '"]').checked; });
    return C.validate(value);
  }
  function hasWork() {
    return textFields.some(key => $(key).value.length > 0) ||
      [...document.querySelectorAll('[data-check]')].some(input => input.checked);
  }
  function apply(value) {
    C.validate(value);
    textFields.forEach(key => { $(key).value = value[key]; });
    $('pace').value = value.pace; $('seconds').value = value.seconds; $('fictional').checked = value.fictional;
    C.CHECKS.forEach(key => { document.querySelector('[data-check="' + key + '"]').checked = value.checks[key]; });
    $('copyFallback').hidden = true; $('copyText').value = '';
    render();
  }
  function render() {
    let value;
    try { value = state(); }
    catch (error) {
      ['sourceWords', 'cutWords', 'duration'].forEach(id => { $(id).textContent = '—'; });
      $('budgetText').textContent = 'Choose a speaking pace between 60 and 220 words per minute.';
      $('numberFlags').replaceChildren();
      $('numberIntro').textContent = 'Choose a valid pace to update comparisons.';
      return;
    }
    const stats = C.analyze(value);
    $('sourceWords').textContent = stats.sourceWords;
    $('cutWords').textContent = stats.cutWords;
    $('duration').textContent = stats.estimatedSeconds;
    $('budgetText').textContent = 'At this pace, ' + value.seconds + ' seconds is roughly ' + stats.budgetWords +
      ' words. Your shorter answer is ' + (stats.cutWords > stats.budgetWords ? stats.cutWords - stats.budgetWords + ' words over that budget.' : stats.budgetWords - stats.cutWords + ' words below that budget.');
    $('numberFlags').replaceChildren();
    let numberMessage = 'No new digit-written numeric strings spotted. This does not establish that the answer is accurate.';
    if (!value.source.trim()) numberMessage = 'Add an original answer before comparing numeric strings.';
    else if (stats.newNumbers.length) numberMessage = 'These numeric strings appear in the edit but not in the original. Check each against your actual evidence.';
    $('numberIntro').textContent = numberMessage;
    if (value.source.trim()) stats.newNumbers.forEach(number => {
      const item = document.createElement('li'); const code = document.createElement('code');
      code.textContent = number; item.append(code, ' — not present in the original'); $('numberFlags').append(item);
    });
  }
  function checked(action) {
    try { action(state()); } catch (error) { announce(error.message, true); }
  }
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], {type}));
    const link = document.createElement('a'); link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('Downloaded ' + name + '. Keep it somewhere private.');
  }
  textFields.concat(['pace', 'seconds']).forEach(id => $(id).addEventListener('input', render));
  $('loadExample').addEventListener('click', () => {
    if (hasWork() && !window.confirm('Replace the current draft with the fictional example? Export your work first if needed.')) return;
    apply(example); announce('Fictional example loaded. It is teaching material, not a real candidate or customer result.');
  });
  $('clear').addEventListener('click', () => {
    if (hasWork() && !window.confirm('Clear this draft? Exported files will not be changed.')) return;
    apply(C.blank()); announce('Draft cleared.'); $('question').focus();
  });
  $('startCut').addEventListener('click', () => {
    if (!$('source').value.trim()) { announce('Write or paste an original answer first.', true); return; }
    if ($('cut').value && !window.confirm('Replace the shorter answer with a fresh copy of the original?')) return;
    $('cut').value = $('source').value; render(); announce('Copied the original into the editor. Your original remains available.'); $('cut').focus();
  });
  $('park').addEventListener('click', () => {
    try {
      const result = C.moveSelection($('cut').value, $('followups').value, $('cut').selectionStart, $('cut').selectionEnd);
      if (result.followups.length > 20000) throw new Error('Follow-up notes are full. Export them before adding more.');
      $('cut').value = result.cut; $('followups').value = result.followups; render();
      announce('Moved the selection to follow-ups. The original answer was not changed.'); $('cut').focus();
    } catch (error) { announce(error.message, true); }
  });
  $('copy').addEventListener('click', async () => {
    const text = $('cut').value;
    if (!text.trim()) { announce('Add a shorter answer before copying it.', true); return; }
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text); $('copyFallback').hidden = true; announce('Shorter answer copied.');
    } catch (_) {
      $('copyFallback').hidden = false; $('copyText').value = text; $('copyText').focus(); $('copyText').select();
      announce('Clipboard access is unavailable. The text below is selected for manual copying.');
    }
  });
  $('saveJson').addEventListener('click', () => checked(value => download('answer-cut-practice.json', JSON.stringify(value, null, 2) + '\n', 'application/json')));
  $('saveMarkdown').addEventListener('click', () => checked(value => download('answer-cut-practice.md', C.markdown(value), 'text/markdown')));
  $('importButton').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 512000) throw new Error('That file is too large. Choose an Answer Cut Lab JSON file under 512 KB.');
      const value = C.validate(JSON.parse(await file.text()));
      if (hasWork() && !window.confirm('Replace this draft with the practice file? Export current work first if needed.')) return;
      apply(value); announce('Practice file opened. Its claims and checklist are user-entered, not verified facts.');
    } catch (error) { announce('Could not open that file: ' + error.message + ' Your draft was kept.', true); }
    finally { event.target.value = ''; }
  });
  apply(C.blank());
})();

