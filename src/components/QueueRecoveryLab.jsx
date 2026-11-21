import React, { useState } from 'react';
import { queueRecovery } from '../utils/labModels.js';

const inputs = [
  ['arrivals', 'Incoming jobs per second', 50, 1000, 50],
  ['outageSeconds', 'Worker outage in seconds', 0, 600, 10],
  ['workers', 'Workers after restart', 1, 20, 1],
  ['perWorker', 'Jobs per worker per second', 10, 100, 10],
  ['downstreamLimit', 'Downstream limit in jobs per second', 50, 1500, 50],
];
const defaults = { arrivals: 200, outageSeconds: 60, workers: 6, perWorker: 50, downstreamLimit: 400 };
const format = (value) => Math.round(value).toLocaleString();

export default function QueueRecoveryLab() {
  const [settings, setSettings] = useState(defaults);
  const model = queueRecovery(settings);
  const times = [0, 30, 60, 120, 300];
  const maximum = Math.max(1, ...times.map(model.backlogAfter));
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <section className="notebook-card space-y-4 p-5">
        <h2 className="font-display text-xl font-bold">Recover a worker queue</h2>
        <p className="text-sm">An empty queue keeps accepting jobs while its workers are offline. Predict when it will empty after restart. Then limit the downstream service and try adding more workers.</p>
        {inputs.map(([key, label, min, max, step]) => (
          <label key={key} className="block text-sm">
            <span className="flex justify-between gap-2">{label} <strong>{settings[key]}</strong></span>
            <input type="range" className="w-full accent-emerald-700" min={min} max={max} step={step} value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: Number(e.target.value) })} />
          </label>
        ))}
        <button className="notebook-btn text-xs" type="button" onClick={() => setSettings(defaults)}>Restore example</button>
      </section>
      <section className="notebook-card space-y-4 p-5">
        <h2 className="font-display text-xl font-bold">Backlog after restart</h2>
        <div className="rounded-xl bg-sage/35 p-4 dark:bg-sage-dark">
          <div className="font-display text-2xl font-bold">{Number.isFinite(model.recoverySeconds) ? `${format(Math.ceil(model.recoverySeconds))} seconds to clear` : 'No recovery at this rate'}</div>
          <p className="mt-1 text-sm">Workers and downstream capacity allow {format(model.serviceRate)} jobs/s. With {format(settings.arrivals)} arriving each second, the queue {model.spare === 0 ? 'stays level' : model.spare > 0 ? `can drain by ${format(model.spare)} jobs/s` : `grows by ${format(-model.spare)} jobs/s`}.</p>
        </div>
        <dl className="space-y-2 text-sm">
          {times.map((seconds) => (
            <div key={seconds} className="grid grid-cols-[6rem_1fr] items-center gap-3">
              <dt>{seconds === 0 ? 'At restart' : `After ${seconds} s`}</dt>
              <dd><strong>{format(model.backlogAfter(seconds))} jobs</strong><div aria-hidden="true" className="mt-1 h-2 rounded bg-paper-subtle dark:bg-ink-elevated"><div className="h-full rounded bg-sage-strong" style={{ width: `${100 * model.backlogAfter(seconds) / maximum}%` }} /></div></dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-ink-muted dark:text-paper-ink/75">Model assumes steady arrivals, equal job cost, successful processing, and enough queue storage. Initial backlog equals arrivals × outage duration. A positive backlog clears only when service exceeds arrivals.</p>
        <a className="text-sm underline underline-offset-2" href="#/queue-backlog-recovery/1">Read the queue recovery lesson</a>
      </section>
    </div>
  );
}
