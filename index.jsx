import { useState } from 'react'
import { Panel, StatCard, DataTable, Button } from '@framework/ui'

const KIND_LABELS = {
  audioinput:  'Microphone',
  audiooutput: 'Speaker',
  videoinput:  'Camera',
}

export default {
  id: 'wraith-devices',
  name: 'Device Enumerator',
  version: '1.0.0',
  author: 'wraith',
  date: '2026-04-20',
  description: 'Enumerates camera, microphone, and audio output devices. Labels available only after permission grant.',

  capture: {
    poll: [{
      id: 'device-enum',
      interval: 1000,
      persist: true,
      collect: () => {
        if (window.__wraith_devices_done) return null
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          window.__wraith_devices_done = true
          return { devices: [], error: 'mediaDevices API not available', perms: {}, attempts: [] }
        }
        if (!window.__wraith_devices_started) {
          window.__wraith_devices_started = true
          navigator.mediaDevices.enumerateDevices()
            .then(function(list) {
              window.__wraith_devices_result = {
                devices: list.map(function(d) {
                  return {
                    kind:    d.kind,
                    label:   d.label || '',
                    groupId: d.groupId ? d.groupId.slice(0, 8) : '',
                  }
                }),
                error: null,
                perms: {},
                attempts: [],
              }
            })
            .catch(function(err) {
              window.__wraith_devices_result = { devices: [], error: String(err), perms: {}, attempts: [] }
            })
        }
        if (window.__wraith_devices_result) {
          window.__wraith_devices_done = true
          return window.__wraith_devices_result
        }
        return null
      },
    }],
  },

  commands: [
    {
      id:     're-enumerate',
      label:  'Re-enumerate Devices',
      params: {},
      handler: () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          return 'mediaDevices API not available'
        }
        navigator.mediaDevices.enumerateDevices()
          .then(function(list) {
            window.__wraith_devices_result = {
              devices: list.map(function(d) {
                return { kind: d.kind, label: d.label || '', groupId: d.groupId ? d.groupId.slice(0, 8) : '' }
              }),
              error: null,
              perms: window.__wraith_devices_perms || {},
              attempts: window.__wraith_devices_attempts || [],
            }
            window.__wraith_devices_done = false
          })
        return 'enumerating'
      },
    },
    {
      id:     'request-audio',
      label:  'Request Audio Permission',
      params: {},
      handler: () => {
        if (!window.__wraith_devices_perms) window.__wraith_devices_perms = {}
        if (!window.__wraith_devices_attempts) window.__wraith_devices_attempts = []
        var attempt = { type: 'audio', timestamp: Date.now(), result: 'prompting' }
        window.__wraith_devices_attempts.push(attempt)
        window.__wraith_devices_perms.audio = 'prompting'
        window.__wraith_devices_result = {
          devices: (window.__wraith_devices_result || {}).devices || [],
          error: null,
          perms: window.__wraith_devices_perms,
          attempts: window.__wraith_devices_attempts,
        }
        window.__wraith_devices_done = false
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function(stream) {
            stream.getTracks().forEach(function(t) { t.stop() })
            window.__wraith_devices_perms.audio = 'granted'
            attempt.result = 'granted'
            attempt.completedAt = Date.now()
            return navigator.mediaDevices.enumerateDevices()
          })
          .then(function(list) {
            window.__wraith_devices_result = {
              devices: list.map(function(d) {
                return { kind: d.kind, label: d.label || '', groupId: d.groupId ? d.groupId.slice(0, 8) : '' }
              }),
              error: null,
              perms: window.__wraith_devices_perms,
              attempts: window.__wraith_devices_attempts,
            }
            window.__wraith_devices_done = false
          })
          .catch(function(err) {
            var msg = String(err)
            var result = 'error'
            if (msg.indexOf('NotAllowedError') !== -1) result = 'denied'
            else if (msg.indexOf('NotFoundError') !== -1) result = 'unavailable'
            window.__wraith_devices_perms.audio = result
            attempt.result = result
            attempt.completedAt = Date.now()
            window.__wraith_devices_result = {
              devices: (window.__wraith_devices_result || {}).devices || [],
              error: null,
              perms: window.__wraith_devices_perms,
              attempts: window.__wraith_devices_attempts,
            }
            window.__wraith_devices_done = false
          })
        return 'prompted'
      },
    },
    {
      id:     'request-camera',
      label:  'Request Camera Permission',
      params: {},
      handler: () => {
        if (!window.__wraith_devices_perms) window.__wraith_devices_perms = {}
        if (!window.__wraith_devices_attempts) window.__wraith_devices_attempts = []
        var attempt = { type: 'camera', timestamp: Date.now(), result: 'prompting' }
        window.__wraith_devices_attempts.push(attempt)
        window.__wraith_devices_perms.camera = 'prompting'
        window.__wraith_devices_result = {
          devices: (window.__wraith_devices_result || {}).devices || [],
          error: null,
          perms: window.__wraith_devices_perms,
          attempts: window.__wraith_devices_attempts,
        }
        window.__wraith_devices_done = false
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(function(stream) {
            stream.getTracks().forEach(function(t) { t.stop() })
            window.__wraith_devices_perms.camera = 'granted'
            attempt.result = 'granted'
            attempt.completedAt = Date.now()
            return navigator.mediaDevices.enumerateDevices()
          })
          .then(function(list) {
            window.__wraith_devices_result = {
              devices: list.map(function(d) {
                return { kind: d.kind, label: d.label || '', groupId: d.groupId ? d.groupId.slice(0, 8) : '' }
              }),
              error: null,
              perms: window.__wraith_devices_perms,
              attempts: window.__wraith_devices_attempts,
            }
            window.__wraith_devices_done = false
          })
          .catch(function(err) {
            var msg = String(err)
            var result = 'error'
            if (msg.indexOf('NotAllowedError') !== -1) result = 'denied'
            else if (msg.indexOf('NotFoundError') !== -1) result = 'unavailable'
            window.__wraith_devices_perms.camera = result
            attempt.result = result
            attempt.completedAt = Date.now()
            window.__wraith_devices_result = {
              devices: (window.__wraith_devices_result || {}).devices || [],
              error: null,
              perms: window.__wraith_devices_perms,
              attempts: window.__wraith_devices_attempts,
            }
            window.__wraith_devices_done = false
          })
        return 'prompted'
      },
    },
  ],

  live: (state = { status: 'pending', devices: [], perms: {}, attempts: [] }, event) => {
    if (event.type === 'device-enum' && event.payload) {
      return {
        status:   event.payload.error ? 'error' : 'done',
        devices:  event.payload.devices || [],
        error:    event.payload.error || null,
        perms:    event.payload.perms || state.perms || {},
        attempts: event.payload.attempts || state.attempts || [],
      }
    }
    return state
  },

  ui: {
    nav: { label: 'Devices', icon: 'camera' },

    panel: ({ live, session, sendCommand }) => {
      const status   = live.status ?? 'pending'
      const devices  = live.devices ?? []
      const perms    = live.perms ?? {}
      const attempts = live.attempts ?? []
      const cameras  = devices.filter(d => d.kind === 'videoinput').length
      const mics     = devices.filter(d => d.kind === 'audioinput').length
      const speakers = devices.filter(d => d.kind === 'audiooutput').length
      const isActive = session.status === 'active'

      const btnLabel = (kind, perm) => {
        if (perm === 'granted')     return kind + ' ✓'
        if (perm === 'prompting')   return kind + '…'
        return 'Request ' + kind
      }

      const btnVariant = (perm) => {
        if (perm === 'denied' || perm === 'unavailable' || perm === 'error') return 'danger'
        return 'default'
      }

      const statusLine = (perm) => {
        if (perm === 'denied')      return 'Last attempt: denied by user'
        if (perm === 'unavailable') return 'Last attempt: no device found'
        if (perm === 'error')       return 'Last attempt: error'
        return null
      }

      const audioAttempts = attempts.filter(a => a.type === 'audio')
      const cameraAttempts = attempts.filter(a => a.type === 'camera')

      return (
        <Panel title="Device Enumerator">
          <div className="flex gap-2 flex-wrap">
            <StatCard label="Status"   value={status === 'pending' ? 'Pending…' : status === 'done' ? 'Collected' : 'Error'} />
            <StatCard label="Cameras"  value={cameras} />
            <StatCard label="Mics"     value={mics} />
            <StatCard label="Speakers" value={speakers} />
          </div>
          {live.error && (
            <div className="text-red-400 text-xs mt-2 font-mono">{live.error}</div>
          )}
          {status === 'pending' && isActive && (
            <div className="mt-3">
              <Button label="Refresh Devices" onClick={() => sendCommand('re-enumerate')} variant="ghost" />
            </div>
          )}
          {status === 'done' && (
            <div className="mt-3 space-y-3">
              <div className="text-muted text-xs">Prompt user for permission to reveal device labels:</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  label={btnLabel('Audio', perms.audio)}
                  onClick={() => sendCommand('request-audio')}
                  disabled={!isActive || perms.audio === 'prompting' || perms.audio === 'granted'}
                  variant={btnVariant(perms.audio)}
                />
                <Button
                  label={btnLabel('Camera', perms.camera)}
                  onClick={() => sendCommand('request-camera')}
                  disabled={!isActive || perms.camera === 'prompting' || perms.camera === 'granted'}
                  variant={btnVariant(perms.camera)}
                />
                <Button
                  label="Refresh Devices"
                  onClick={() => sendCommand('re-enumerate')}
                  disabled={!isActive}
                  variant="ghost"
                />
              </div>
              {(statusLine(perms.audio) || statusLine(perms.camera)) && (
                <div className="space-y-1">
                  {statusLine(perms.audio) && (
                    <div className="text-red-400 text-xs">Audio: {statusLine(perms.audio)}</div>
                  )}
                  {statusLine(perms.camera) && (
                    <div className="text-red-400 text-xs">Camera: {statusLine(perms.camera)}</div>
                  )}
                </div>
              )}
              {attempts.length > 0 && (
                <div className="border-t border-border pt-2">
                  <div className="text-muted text-xs mb-1">
                    Permission attempts ({attempts.length}):
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {[...attempts].reverse().map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-muted">{new Date(a.timestamp).toLocaleTimeString()}</span>
                        <span className="text-gray-300">{a.type}</span>
                        <span className={
                          a.result === 'granted' ? 'text-green-400' :
                          a.result === 'denied' ? 'text-red-400' :
                          a.result === 'prompting' ? 'text-yellow-400' :
                          'text-orange-400'
                        }>
                          {a.result}
                        </span>
                        {a.completedAt && (
                          <span className="text-muted">({Math.round((a.completedAt - a.timestamp) / 1000)}s)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>
      )
    },

    view: ({ data, session }) => {
      const ev      = [...data.events].reverse().find(e => e.type === 'device-enum' && e.payload)
      const devices = ev?.payload?.devices ?? []
      const error   = ev?.payload?.error ?? null
      const attempts = ev?.payload?.attempts ?? []

      const cameras  = devices.filter(d => d.kind === 'videoinput').length
      const mics     = devices.filter(d => d.kind === 'audioinput').length
      const speakers = devices.filter(d => d.kind === 'audiooutput').length

      const rows = devices.map((d, i) => ({
        '#':     i + 1,
        'Kind':  KIND_LABELS[d.kind] ?? d.kind,
        'Label': d.label || '(no label — permission not granted)',
        'Group': d.groupId || '—',
      }))

      const exportData = {
        session: {
          id:     session.id,
          url:    session.meta.url,
          ua:     session.meta.userAgent,
        },
        devices: devices,
        attempts: attempts.map(a => ({
          type:        a.type,
          result:      a.result,
          requestedAt: a.timestamp ? new Date(a.timestamp).toISOString() : null,
          completedAt: a.completedAt ? new Date(a.completedAt).toISOString() : null,
        })),
      }

      const downloadFile = (content, filename, mime) => {
        const blob = new Blob([content], { type: mime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }

      const exportJSON = () => {
        downloadFile(JSON.stringify(exportData, null, 2), 'wraith-devices-' + session.id.slice(0, 8) + '.json', 'application/json')
      }

      const exportCSV = () => {
        const lines = ['#,Kind,Label,Group']
        devices.forEach((d, i) => {
          const label = (d.label || '(no label)').replace(/"/g, '""')
          lines.push((i + 1) + ',' + (KIND_LABELS[d.kind] ?? d.kind) + ',"' + label + '",' + (d.groupId || '—'))
        })
        if (attempts.length > 0) {
          lines.push('')
          lines.push('Attempt Type,Result,Requested At,Completed At')
          attempts.forEach(a => {
            lines.push(
              a.type + ',' +
              a.result + ',' +
              (a.timestamp ? new Date(a.timestamp).toISOString() : '') + ',' +
              (a.completedAt ? new Date(a.completedAt).toISOString() : '')
            )
          })
        }
        downloadFile(lines.join('\n'), 'wraith-devices-' + session.id.slice(0, 8) + '.csv', 'text/csv')
      }

      return (
        <Panel title="Device Enumerator">
          {error ? (
            <div className="text-red-400 font-mono text-sm">{error}</div>
          ) : devices.length === 0 ? (
            <div className="text-muted text-sm">No devices collected yet.</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <StatCard label="Cameras"  value={cameras} />
                  <StatCard label="Mics"     value={mics} />
                  <StatCard label="Speakers" value={speakers} />
                </div>
                <div className="flex gap-2">
                  <Button label="Export JSON" onClick={exportJSON} variant="ghost" />
                  <Button label="Export CSV"  onClick={exportCSV}  variant="ghost" />
                </div>
              </div>
              <DataTable columns={['#', 'Kind', 'Label', 'Group']} rows={rows} />
              {attempts.length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="text-xs text-muted mb-2">Permission Request History</div>
                  <DataTable
                    columns={['Type', 'Result', 'Requested', 'Completed', 'Duration']}
                    rows={attempts.map(a => ({
                      'Type':      a.type,
                      'Result':    a.result,
                      'Requested': a.timestamp ? new Date(a.timestamp).toLocaleString() : '—',
                      'Completed': a.completedAt ? new Date(a.completedAt).toLocaleString() : '—',
                      'Duration':  a.completedAt ? Math.round((a.completedAt - a.timestamp) / 1000) + 's' : '—',
                    }))}
                  />
                </div>
              )}
            </>
          )}
        </Panel>
      )
    },
  },
}
