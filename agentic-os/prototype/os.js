// The Line — an agentic phone OS simulator.
// os.js: device state, the capability registry, the policy gate, and the ledger.
// Everything here is plain data and functions so the planner (offline rules or a live model)
// can only act through typed capabilities, never by touching state directly.
'use strict';

const OS = (() => {
  // ---------------------------------------------------------------- device state
  const initialState = () => ({
    clock: { day: 'Thu', time: '21:40' },
    audio: { volume: 45, ringer: 'ring' },
    display: { brightness: 70, nightShift: false },
    bluetooth: {
      on: true,
      connected: null,
      paired: [
        { id: 'airpods', name: 'AirPods Pro', kind: 'headphones', battery: 80 },
        { id: 'car', name: 'Car audio', kind: 'car' },
        { id: 'speaker', name: 'Kitchen speaker', kind: 'speaker' },
      ],
      nearby: [{ id: 'jbl', name: 'JBL Flip 6', kind: 'speaker' }],
    },
    wifi: { on: true, network: 'Home' },
    airplane: false,
    focus: { mode: 'off' },
    alarms: [{ id: 'a1', time: '07:00', label: 'Weekdays', on: true }],
    timers: [],
    flashlight: false,
    battery: { level: 62, lowPower: false },
    media: { playing: false, title: null },
    reminders: [],
    calendar: [
      { id: 'e1', day: 'Fri', time: '09:30', title: 'Team standup', minutes: 15 },
      { id: 'e2', day: 'Fri', time: '16:00', title: 'Dentist, Dr. Patel', minutes: 45 },
    ],
    contacts: [
      { id: 'mom', name: 'Mom' }, { id: 'sam', name: 'Sam' }, { id: 'maya', name: 'Maya' }, { id: 'lee', name: 'Dr. Lee' },
    ],
    outbox: [],
    wallet: { perPurchaseCap: 50, spentToday: 0 },
  });
  let state = initialState();
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => fn(state));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = (p) => p + Math.random().toString(36).slice(2, 7);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // ---------------------------------------------------------------- helpers
  const findDevice = (q) => {
    if (!q) return null;
    const s = String(q).toLowerCase();
    const all = [...state.bluetooth.paired.map(d => ({ ...d, paired: true })), ...state.bluetooth.nearby.map(d => ({ ...d, paired: false }))];
    return all.find(d => d.id === s) || all.find(d => d.name.toLowerCase().includes(s))
      || all.find(d => (s.includes('headphone') || s.includes('earbud') || s.includes('airpod')) && d.kind === 'headphones')
      || all.find(d => s.includes('car') && d.kind === 'car')
      || all.find(d => s.includes('speaker') && d.kind === 'speaker' && d.paired)
      || null;
  };
  const findContact = (q) => {
    const s = String(q || '').toLowerCase().replace(/^(my |to )/, '');
    return state.contacts.find(c => c.name.toLowerCase() === s) || state.contacts.find(c => c.name.toLowerCase().includes(s) && s.length > 1) || null;
  };
  const fmtTime = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM'; const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
  };
  const untilText = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number); const [ch, cm] = state.clock.time.split(':').map(Number);
    let mins = (h * 60 + m) - (ch * 60 + cm); if (mins <= 0) mins += 24 * 60;
    return `${Math.floor(mins / 60)} h ${mins % 60} min from now`;
  };

  // ---------------------------------------------------------------- capabilities
  // risk: read < reversible < consequential < irreversible
  const RISK = { read: 0, reversible: 1, consequential: 2, irreversible: 3 };
  const capabilities = {};
  function cap(id, def) { capabilities[id] = { id, ...def }; }

  cap('device.status', {
    title: 'Read device status', risk: 'read', provider: 'System',
    description: 'Returns volume, brightness, Bluetooth, Wi-Fi, focus, battery, alarms and what is playing.',
    params: {},
    run: () => ({
      summary: 'Read the device status',
      result: { volume: state.audio.volume, ringer: state.audio.ringer, brightness: state.display.brightness, bluetooth: state.bluetooth.on ? (state.bluetooth.connected || 'on, nothing connected') : 'off', wifi: state.wifi.on ? state.wifi.network : 'off', focus: state.focus.mode, battery: state.battery.level + '%' + (state.battery.lowPower ? ' (Low Power)' : ''), alarms: state.alarms.filter(a => a.on).map(a => a.time), playing: state.media.playing ? state.media.title : null },
      card: { type: 'info', icon: 'phone', title: 'Right now', rows: [
        ['Volume', state.audio.volume + '%'], ['Output', state.bluetooth.connected ? (findDevice(state.bluetooth.connected) || {}).name : 'iPhone speaker'],
        ['Battery', state.battery.level + '%' + (state.battery.lowPower ? ' · Low Power' : '')], ['Focus', state.focus.mode === 'off' ? 'Off' : state.focus.mode],
        ['Next alarm', (state.alarms.find(a => a.on) || {}).time ? fmtTime(state.alarms.find(a => a.on).time) : 'None']] },
    }),
  });

  cap('audio.setVolume', {
    title: 'Set volume', risk: 'reversible', provider: 'System · Audio',
    description: 'Sets media volume for the current output (speaker or connected headphones). level is 0-100; or pass delta to change it relative to now.',
    params: { level: { type: 'number', minimum: 0, maximum: 100 }, delta: { type: 'number' } },
    run: (a) => {
      const before = state.audio.volume;
      const level = clamp(Math.round(a.level != null ? Number(a.level) : before + Number(a.delta || 0)), 0, 100);
      state.audio.volume = level;
      const out = state.bluetooth.connected ? findDevice(state.bluetooth.connected).name : 'iPhone speaker';
      return { summary: `Volume ${before}% → ${level}% on ${out}`, result: { volume: level, output: out },
        undo: () => { state.audio.volume = before; },
        card: { type: 'slider', icon: level === 0 ? 'mute' : 'volume', title: 'Volume · ' + out, value: level, min: 0, max: 100, unit: '%', bind: { cap: 'audio.setVolume', arg: 'level' } } };
    },
  });

  cap('audio.setRinger', {
    title: 'Set ringer mode', risk: 'reversible', provider: 'System · Audio',
    description: 'Sets the ringer to ring, vibrate or silent.',
    params: { mode: { type: 'string', enum: ['ring', 'vibrate', 'silent'] } },
    run: (a) => { const before = state.audio.ringer; const mode = ['ring', 'vibrate', 'silent'].includes(a.mode) ? a.mode : 'silent'; state.audio.ringer = mode;
      return { summary: `Ringer: ${before} → ${mode}`, result: { ringer: mode }, undo: () => { state.audio.ringer = before; },
        card: { type: 'segmented', icon: 'bell', title: 'Ringer', value: mode, options: ['ring', 'vibrate', 'silent'], bind: { cap: 'audio.setRinger', arg: 'mode' } } }; },
  });

  cap('display.setBrightness', {
    title: 'Set brightness', risk: 'reversible', provider: 'System · Display',
    description: 'Sets screen brightness 0-100, or changes it by delta.',
    params: { level: { type: 'number', minimum: 0, maximum: 100 }, delta: { type: 'number' } },
    run: (a) => { const before = state.display.brightness; const level = clamp(Math.round(a.level != null ? Number(a.level) : before + Number(a.delta || 0)), 0, 100); state.display.brightness = level;
      return { summary: `Brightness ${before}% → ${level}%`, result: { brightness: level }, undo: () => { state.display.brightness = before; },
        card: { type: 'slider', icon: 'sun', title: 'Brightness', value: level, min: 0, max: 100, unit: '%', bind: { cap: 'display.setBrightness', arg: 'level' } } }; },
  });

  cap('bluetooth.setPower', {
    title: 'Turn Bluetooth on or off', risk: 'reversible', provider: 'System · Bluetooth',
    description: 'Turns Bluetooth on or off. Turning it off disconnects any device.',
    params: { on: { type: 'boolean' } },
    run: (a) => { const before = clone(state.bluetooth); state.bluetooth.on = !!a.on; if (!a.on) state.bluetooth.connected = null;
      return { summary: `Bluetooth ${a.on ? 'on' : 'off'}`, result: { on: !!a.on }, undo: () => { state.bluetooth = before; },
        card: { type: 'toggle', icon: 'bluetooth', title: 'Bluetooth', on: !!a.on, bind: { cap: 'bluetooth.setPower', arg: 'on' } } }; },
  });

  cap('bluetooth.list', {
    title: 'List Bluetooth devices', risk: 'read', provider: 'System · Bluetooth',
    description: 'Lists paired and nearby Bluetooth devices and which one is connected.',
    params: {},
    run: () => ({ summary: 'Listed Bluetooth devices', result: { connected: state.bluetooth.connected, paired: state.bluetooth.paired.map(d => d.name), nearby: state.bluetooth.nearby.map(d => d.name) },
      card: { type: 'list', icon: 'bluetooth', title: 'Bluetooth devices', items: [
        ...state.bluetooth.paired.map(d => ({ label: d.name, sub: state.bluetooth.connected === d.id ? 'Connected' : 'Paired', icon: d.kind === 'car' ? 'car' : d.kind === 'speaker' ? 'speaker' : 'headphones', action: state.bluetooth.connected === d.id ? { cap: 'bluetooth.disconnect', args: { device: d.id }, label: 'Disconnect' } : { cap: 'bluetooth.connect', args: { device: d.id }, label: 'Connect' } })),
        ...state.bluetooth.nearby.map(d => ({ label: d.name, sub: 'Nearby · not paired', icon: 'speaker', action: { cap: 'bluetooth.connect', args: { device: d.id }, label: 'Pair' } }))] } }),
  });

  cap('bluetooth.connect', {
    title: 'Connect a Bluetooth device', risk: 'reversible', provider: 'System · Bluetooth',
    description: 'Connects a paired device by name (for example "AirPods", "car", "kitchen speaker"). Pairing a new nearby device is consequential and needs approval.',
    params: { device: { type: 'string' } },
    riskFor: (a) => { const d = findDevice(a.device); return d && !d.paired ? 'consequential' : 'reversible'; },
    whyRisky: (a) => { const d = findDevice(a.device); return d && !d.paired ? `Pairing a new device (${d.name}) lets it connect again later without asking.` : null; },
    run: (a) => { const d = findDevice(a.device); if (!d) throw new Error(`No Bluetooth device matches "${a.device}"`);
      const before = clone(state.bluetooth); state.bluetooth.on = true;
      if (!d.paired) { state.bluetooth.nearby = state.bluetooth.nearby.filter(x => x.id !== d.id); state.bluetooth.paired.push({ id: d.id, name: d.name, kind: d.kind }); }
      state.bluetooth.connected = d.id;
      return { summary: `${d.paired ? 'Connected' : 'Paired and connected'} ${d.name}`, result: { connected: d.name }, undo: () => { state.bluetooth = before; },
        card: { type: 'device', icon: d.kind === 'car' ? 'car' : d.kind === 'speaker' ? 'speaker' : 'headphones', title: d.name, sub: 'Connected' + (d.battery ? ` · battery ${d.battery}%` : ''), action: { cap: 'bluetooth.disconnect', args: { device: d.id }, label: 'Disconnect' } } }; },
  });

  cap('bluetooth.disconnect', {
    title: 'Disconnect a Bluetooth device', risk: 'reversible', provider: 'System · Bluetooth',
    description: 'Disconnects the named device, or whatever is connected if no name is given.',
    params: { device: { type: 'string' } },
    run: (a) => { const id = a.device ? (findDevice(a.device) || {}).id : state.bluetooth.connected; const before = clone(state.bluetooth);
      if (!id || state.bluetooth.connected !== id) throw new Error('That device is not connected');
      const name = findDevice(id).name; state.bluetooth.connected = null;
      return { summary: `Disconnected ${name}`, result: { disconnected: name }, undo: () => { state.bluetooth = before; } }; },
  });

  cap('wifi.setPower', {
    title: 'Turn Wi-Fi on or off', risk: 'reversible', provider: 'System · Network',
    description: 'Turns Wi-Fi on or off.', params: { on: { type: 'boolean' } },
    run: (a) => { const before = clone(state.wifi); state.wifi.on = !!a.on;
      return { summary: `Wi-Fi ${a.on ? 'on' : 'off'}`, result: { on: !!a.on }, undo: () => { state.wifi = before; },
        card: { type: 'toggle', icon: 'wifi', title: 'Wi-Fi' + (a.on ? ' · ' + state.wifi.network : ''), on: !!a.on, bind: { cap: 'wifi.setPower', arg: 'on' } } }; },
  });

  cap('system.setAirplaneMode', {
    title: 'Airplane mode', risk: 'reversible', provider: 'System · Network',
    description: 'Turns airplane mode on or off. On disconnects Wi-Fi and cellular.', params: { on: { type: 'boolean' } },
    run: (a) => { const before = { airplane: state.airplane, wifi: clone(state.wifi) }; state.airplane = !!a.on; if (a.on) state.wifi.on = false;
      return { summary: `Airplane mode ${a.on ? 'on' : 'off'}`, result: { airplane: !!a.on }, undo: () => { state.airplane = before.airplane; state.wifi = before.wifi; },
        card: { type: 'toggle', icon: 'plane', title: 'Airplane mode', on: !!a.on, bind: { cap: 'system.setAirplaneMode', arg: 'on' } } }; },
  });

  cap('focus.set', {
    title: 'Set a Focus', risk: 'reversible', provider: 'System · Focus',
    description: 'Turns on a Focus (sleep, work, do-not-disturb, driving) or turns Focus off. Optional until time HH:MM.',
    params: { mode: { type: 'string', enum: ['sleep', 'work', 'do not disturb', 'driving', 'off'] }, until: { type: 'string', description: 'HH:MM 24-hour' } },
    run: (a) => { const before = clone(state.focus); const mode = String(a.mode || 'do not disturb'); state.focus = { mode, until: a.until || null };
      return { summary: mode === 'off' ? 'Focus off' : `${mode[0].toUpperCase() + mode.slice(1)} Focus on${a.until ? ' until ' + fmtTime(a.until) : ''}`, result: state.focus, undo: () => { state.focus = before; },
        card: { type: 'toggle', icon: 'moon', title: mode === 'off' ? 'Focus' : `${mode[0].toUpperCase() + mode.slice(1)} Focus`, sub: a.until ? 'Until ' + fmtTime(a.until) : 'Notifications are silenced', on: mode !== 'off', bind: { cap: 'focus.set', arg: 'mode', onValue: mode === 'off' ? 'do not disturb' : mode, offValue: 'off' } } }; },
  });

  cap('alarms.create', {
    title: 'Create an alarm', risk: 'reversible', provider: 'System · Clock',
    description: 'Creates an alarm at time HH:MM (24-hour) with an optional label.',
    params: { time: { type: 'string', description: 'HH:MM 24-hour' }, label: { type: 'string' } },
    run: (a) => { if (!/^\d{1,2}:\d{2}$/.test(String(a.time || ''))) throw new Error('time must be HH:MM (24-hour)');
      const [h, m] = a.time.split(':').map(Number); const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const al = { id: uid('a'), time, label: a.label || 'Alarm', on: true }; state.alarms.push(al);
      return { summary: `Alarm set for ${fmtTime(time)} (${untilText(time)})`, result: al, undo: () => { state.alarms = state.alarms.filter(x => x.id !== al.id); },
        card: { type: 'alarm', id: al.id, time, label: al.label, on: true, sub: untilText(time) } }; },
  });

  cap('alarms.toggle', {
    title: 'Turn an alarm on or off', risk: 'reversible', provider: 'System · Clock',
    description: 'Turns the alarm at time HH:MM (or with id) on or off. Without a time, applies to all alarms.',
    params: { time: { type: 'string' }, id: { type: 'string' }, on: { type: 'boolean' } },
    run: (a) => { const before = clone(state.alarms);
      const targets = state.alarms.filter(x => (a.id ? x.id === a.id : a.time ? x.time === String(a.time).padStart(5, '0') : true));
      if (!targets.length) throw new Error('No matching alarm');
      targets.forEach(x => { x.on = !!a.on; });
      return { summary: `${targets.length === 1 ? 'Alarm ' + fmtTime(targets[0].time) : targets.length + ' alarms'} ${a.on ? 'on' : 'off'}`, result: { changed: targets.length }, undo: () => { state.alarms = before; },
        card: targets.length === 1 ? { type: 'alarm', id: targets[0].id, time: targets[0].time, label: targets[0].label, on: !!a.on } : null }; },
  });

  cap('alarms.list', {
    title: 'List alarms', risk: 'read', provider: 'System · Clock', description: 'Lists all alarms.', params: {},
    run: () => ({ summary: 'Listed alarms', result: state.alarms, card: { type: 'list', icon: 'alarm', title: 'Alarms', items: state.alarms.map(x => ({ label: fmtTime(x.time), sub: x.label + (x.on ? '' : ' · off'), icon: 'alarm', action: { cap: 'alarms.toggle', args: { id: x.id, on: !x.on }, label: x.on ? 'Turn off' : 'Turn on' } })) } }),
  });

  cap('timers.start', {
    title: 'Start a timer', risk: 'reversible', provider: 'System · Clock',
    description: 'Starts a countdown timer for the given number of minutes.', params: { minutes: { type: 'number' }, label: { type: 'string' } },
    run: (a) => { const t = { id: uid('t'), minutes: Number(a.minutes), label: a.label || 'Timer' }; state.timers.push(t);
      return { summary: `Timer: ${t.minutes} min${a.label ? ' · ' + a.label : ''}`, result: t, undo: () => { state.timers = state.timers.filter(x => x.id !== t.id); },
        card: { type: 'timer', title: t.label, minutes: t.minutes } }; },
  });

  cap('flashlight.set', {
    title: 'Flashlight', risk: 'reversible', provider: 'System', description: 'Turns the flashlight on or off.', params: { on: { type: 'boolean' } },
    run: (a) => { const before = state.flashlight; state.flashlight = !!a.on;
      return { summary: `Flashlight ${a.on ? 'on' : 'off'}`, result: { on: !!a.on }, undo: () => { state.flashlight = before; },
        card: { type: 'toggle', icon: 'flashlight', title: 'Flashlight', on: !!a.on, bind: { cap: 'flashlight.set', arg: 'on' } } }; },
  });

  cap('battery.setLowPower', {
    title: 'Low Power Mode', risk: 'reversible', provider: 'System · Battery', description: 'Turns Low Power Mode on or off.', params: { on: { type: 'boolean' } },
    run: (a) => { const before = state.battery.lowPower; state.battery.lowPower = !!a.on;
      return { summary: `Low Power Mode ${a.on ? 'on' : 'off'}`, result: { lowPower: !!a.on }, undo: () => { state.battery.lowPower = before; },
        card: { type: 'toggle', icon: 'battery', title: 'Low Power Mode', sub: `Battery ${state.battery.level}%`, on: !!a.on, bind: { cap: 'battery.setLowPower', arg: 'on' } } }; },
  });

  cap('media.play', {
    title: 'Play music or a podcast', risk: 'reversible', provider: 'Music (capability pack)',
    description: 'Plays something by name or mood on the current output.', params: { query: { type: 'string' } },
    run: (a) => { const before = clone(state.media); const title = a.query ? String(a.query).replace(/^(some|a|the)\s+/i, '') : 'Your mix'; state.media = { playing: true, title };
      const out = state.bluetooth.connected ? findDevice(state.bluetooth.connected).name : 'iPhone speaker';
      return { summary: `Playing “${title}” on ${out}`, result: state.media, undo: () => { state.media = before; },
        card: { type: 'media', title, sub: 'on ' + out, playing: true } }; },
  });

  cap('media.pause', {
    title: 'Pause playback', risk: 'reversible', provider: 'Music (capability pack)', description: 'Pauses whatever is playing.', params: {},
    run: () => { const before = clone(state.media); state.media.playing = false;
      return { summary: 'Paused', result: state.media, undo: () => { state.media = before; } }; },
  });

  cap('calendar.list', {
    title: 'Read calendar', risk: 'read', provider: 'System · Calendar', description: 'Lists events for a day (Thu, Fri...).', params: { day: { type: 'string' } },
    run: (a) => { const day = a.day || 'Fri'; const evs = state.calendar.filter(e => e.day.toLowerCase().startsWith(String(day).toLowerCase().slice(0, 3)));
      return { summary: `Read ${evs.length} events for ${day}`, result: evs, card: { type: 'list', icon: 'calendar', title: day === 'Fri' ? 'Tomorrow' : day, items: evs.length ? evs.map(e => ({ label: e.title, sub: fmtTime(e.time) + ' · ' + e.minutes + ' min', icon: 'calendar' })) : [{ label: 'Nothing scheduled', sub: '', icon: 'calendar' }] } }; },
  });

  cap('calendar.create', {
    title: 'Add a calendar event', risk: 'reversible', provider: 'System · Calendar',
    description: 'Adds an event with title, day (Thu/Fri/Sat...) and time HH:MM.', params: { title: { type: 'string' }, day: { type: 'string' }, time: { type: 'string' }, minutes: { type: 'number' } },
    run: (a) => { const e = { id: uid('e'), title: a.title || 'Event', day: a.day || 'Fri', time: a.time || '12:00', minutes: Number(a.minutes || 30) }; state.calendar.push(e);
      return { summary: `Added “${e.title}”, ${e.day} ${fmtTime(e.time)}`, result: e, undo: () => { state.calendar = state.calendar.filter(x => x.id !== e.id); },
        card: { type: 'info', icon: 'calendar', title: e.title, rows: [['When', `${e.day} ${fmtTime(e.time)}`], ['Length', e.minutes + ' min']] } }; },
  });

  cap('reminders.create', {
    title: 'Create a reminder', risk: 'reversible', provider: 'System · Reminders',
    description: 'Creates a reminder with text and an optional time.', params: { text: { type: 'string' }, when: { type: 'string' } },
    run: (a) => { const r = { id: uid('r'), text: a.text || 'Reminder', when: a.when || null }; state.reminders.push(r);
      return { summary: `Reminder: “${r.text}”${r.when ? ' · ' + r.when : ''}`, result: r, undo: () => { state.reminders = state.reminders.filter(x => x.id !== r.id); },
        card: { type: 'info', icon: 'check', title: r.text, rows: [['When', r.when || 'No time']] } }; },
  });

  cap('messages.send', {
    title: 'Send a message', risk: 'consequential', provider: 'System · Messages',
    description: 'Sends a text message to a contact. Always shown to the person as a draft first; it leaves the phone only after they approve.',
    params: { to: { type: 'string' }, body: { type: 'string' } },
    whyRisky: (a) => `A message to ${a.to} can't be unsent after 10 seconds.`,
    preview: (a) => ({ type: 'draft', to: (findContact(a.to) || { name: a.to }).name, body: a.body }),
    run: (a) => { const c = findContact(a.to); if (!c) throw new Error(`No contact named "${a.to}"`); const m = { id: uid('m'), to: c.name, body: a.body }; state.outbox.push(m);
      return { summary: `Sent to ${c.name}: “${a.body}”`, result: m, undo: () => { state.outbox = state.outbox.filter(x => x.id !== m.id); }, undoWindowSec: 10 }; },
  });

  cap('phone.call', {
    title: 'Place a call', risk: 'consequential', provider: 'System · Phone',
    description: 'Calls a contact.', params: { to: { type: 'string' } },
    whyRisky: (a) => `This rings ${a.to} right away.`,
    run: (a) => { const c = findContact(a.to); if (!c) throw new Error(`No contact named "${a.to}"`);
      return { summary: `Calling ${c.name}…`, result: { calling: c.name }, card: { type: 'call', title: c.name } }; },
  });

  cap('wallet.pay', {
    title: 'Pay someone', risk: 'irreversible', provider: 'System · Wallet',
    description: 'Sends money to a contact. Needs approval with Face ID, and is refused above the per-purchase cap.',
    params: { to: { type: 'string' }, amount: { type: 'number' }, note: { type: 'string' } },
    whyRisky: (a) => `Money can't be pulled back. Your cap is $${state.wallet.perPurchaseCap} per payment.`,
    preview: (a) => ({ type: 'info', icon: 'wallet', title: `Pay ${(findContact(a.to) || { name: a.to }).name}`, rows: [['Amount', '$' + Number(a.amount).toFixed(2)], ['Note', a.note || '—'], ['Cap', '$' + state.wallet.perPurchaseCap + ' per payment']] }),
    run: (a) => { const c = findContact(a.to); const amt = Number(a.amount);
      if (!c) throw new Error(`No contact named "${a.to}"`);
      if (!(amt > 0)) throw new Error('Amount must be positive');
      if (amt > state.wallet.perPurchaseCap) throw new Error(`$${amt} is over your $${state.wallet.perPurchaseCap} per-payment cap. Change the cap in Grants to allow it.`);
      state.wallet.spentToday += amt;
      return { summary: `Paid ${c.name} $${amt.toFixed(2)}${a.note ? ' · ' + a.note : ''}`, result: { paid: amt, to: c.name } }; },
  });

  cap('weather.today', {
    title: 'Weather', risk: 'read', provider: 'Weather (capability pack)', description: 'Returns today and tomorrow’s forecast for the current location.', params: {},
    run: () => ({ summary: 'Read the forecast', result: { now: '18°C, clear', tomorrow: '21°C, light rain after 3 PM' },
      card: { type: 'info', icon: 'cloud', title: 'Weather', rows: [['Now', '18°C, clear'], ['Tomorrow', '21°C, rain after 3 PM']] } }),
  });

  // ---------------------------------------------------------------- policy gate
  const MODES = {
    ask: { label: 'Ask me', autoUpTo: RISK.read },
    auto: { label: 'Auto', autoUpTo: RISK.reversible },
    autopilot: { label: 'Autopilot', autoUpTo: RISK.consequential },
  };
  let mode = 'auto';
  // Grants: standing permissions the person gave for this session ("always allow messages to Mom").
  const grants = [];
  function grantFor(capId, args) {
    return grants.find(g => g.cap === capId && Object.entries(g.match || {}).every(([k, v]) => String(args[k] || '').toLowerCase() === String(v).toLowerCase()));
  }
  function addGrant(capId, match, label) { if (!grantFor(capId, match)) grants.push({ id: uid('g'), cap: capId, match, label }); emit(); }
  function revokeGrant(id) { const i = grants.findIndex(g => g.id === id); if (i >= 0) grants.splice(i, 1); emit(); }
  function riskOf(capId, args) { const c = capabilities[capId]; return c.riskFor ? c.riskFor(args) : c.risk; }
  /** Deterministic: the model never decides whether its own action is safe. */
  function decide(capId, args) {
    const c = capabilities[capId];
    if (!c) return { verdict: 'deny', reason: `Unknown capability ${capId}` };
    const risk = riskOf(capId, args);
    if (risk === 'irreversible') return { verdict: 'ask', faceId: true, risk, reason: (c.whyRisky && c.whyRisky(args)) || 'This can’t be undone.' };
    if (RISK[risk] <= MODES[mode].autoUpTo) return { verdict: 'allow', risk, reason: `${risk} · allowed in ${MODES[mode].label} mode` };
    const g = risk === 'consequential' && grantFor(capId, args);
    if (g) return { verdict: 'allow', risk, reason: `${risk} · you allowed “${g.label}” for this session` };
    return { verdict: 'ask', risk, reason: (c.whyRisky && c.whyRisky(args)) || `${risk} action` };
  }

  // ---------------------------------------------------------------- ledger
  const ledger = [];
  function record(entry) { const e = { id: uid('l'), at: state.clock.time, undone: false, ...entry }; ledger.unshift(e); return e; }
  function undo(id) {
    const e = id ? ledger.find(x => x.id === id) : ledger.find(x => x.undo && !x.undone);
    if (!e) return { ok: false, summary: 'Nothing to undo' };
    if (!e.undo) return { ok: false, summary: `“${e.summary}” can't be undone` };
    if (e.undone) return { ok: false, summary: 'Already undone' };
    e.undo(); e.undone = true; emit();
    return { ok: true, summary: `Undid: ${e.summary}` };
  }
  // Undo everything one run did, newest first: a checkpoint per request.
  function undoRun(runId) {
    const entries = ledger.filter(x => x.runId === runId && x.undo && !x.undone);
    entries.forEach(x => { x.undo(); x.undone = true; });
    emit();
    return entries.map(x => x.summary);
  }

  // Run a capability after the policy gate has allowed it. `who` is 'agent' or 'you' (direct manipulation).
  function execute(capId, args, who = 'agent', runId = null) {
    const c = capabilities[capId];
    const out = c.run(args || {});
    const entry = record({ who, cap: capId, args: args || {}, runId, summary: out.summary, undo: out.undo || null, risk: riskOf(capId, args || {}) });
    if (out.undoWindowSec && entry.undo) setTimeout(() => { if (!entry.undone) { entry.undo = null; entry.expired = true; emit(); } }, out.undoWindowSec * 1000);
    emit();
    return { ...out, entry };
  }

  function catalog() {
    return Object.values(capabilities).map(c => ({ id: c.id, title: c.title, risk: c.risk, provider: c.provider, description: c.description, params: c.params }));
  }

  return {
    get state() { return state; }, reset() { state = initialState(); ledger.length = 0; grants.length = 0; emit(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    capabilities, catalog, decide, execute, undo, undoRun, ledger, grants, addGrant, revokeGrant, riskOf, RISK, MODES,
    get mode() { return mode; }, setMode(m) { if (MODES[m]) { mode = m; emit(); } },
    findDevice, findContact, fmtTime, emit,
  };
})();
