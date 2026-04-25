/**
 * Audio recorder wrapper around MediaRecorder + WebAudio for UI level meter.
 * Tuned for iOS Safari PWA (audio/mp4 AAC produced by default) and
 * Chrome/Firefox desktop (audio/webm opus).
 *
 * Usage:
 *   const rec = createAudioRecorder({ onLevel, onStateChange, onError })
 *   await rec.start()    // prompts mic permission first time
 *   const blob = await rec.stop()
 *   // or rec.cancel() to abort + discard
 */

export type RecorderState =
  | 'idle'
  | 'requesting'  // waiting on getUserMedia
  | 'recording'
  | 'stopping'
  | 'error'

export type AudioRecorderOptions = {
  onLevel?: (level: number) => void            // 0..1 normalised RMS
  onStateChange?: (state: RecorderState) => void
  onError?: (err: Error) => void
  /** Min recording duration in ms before `stop()` will return a blob. Anything
   *  shorter is treated as an accidental tap and discarded. Default 400ms. */
  minDurationMs?: number
}

export type AudioRecorder = {
  state: RecorderState
  start(): Promise<void>
  stop(): Promise<Blob>
  cancel(): void
  elapsedMs(): number
}

/**
 * Pick the best MediaRecorder mimeType supported on the current device.
 * Returns undefined when nothing matches (MediaRecorder uses its default).
 */
export function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const candidates = [
    'audio/mp4',                  // iOS Safari (AAC)
    'audio/mp4;codecs=mp4a.40.2', // iOS AAC explicit
    'audio/webm;codecs=opus',     // Chrome/Firefox
    'audio/webm',
    'audio/ogg;codecs=opus',
  ]
  for (const t of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t
    } catch {
      // older browsers throw on unknown types; keep trying
    }
  }
  return undefined
}

export function isMediaRecorderSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator?.mediaDevices?.getUserMedia === 'function'
  )
}

export function createAudioRecorder(
  opts: AudioRecorderOptions = {},
): AudioRecorder {
  const minDurationMs = opts.minDurationMs ?? 400

  let state: RecorderState = 'idle'
  let stream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let startTs = 0

  // WebAudio graph for level metering — optional, fails silent.
  let audioCtx: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let levelRaf: number | null = null
  let levelBuf: Uint8Array | null = null

  function setState(next: RecorderState) {
    state = next
    opts.onStateChange?.(next)
  }

  function setupLevelMeter(s: MediaStream) {
    try {
      const Ctor = window.AudioContext
      if (!Ctor) return
      audioCtx = new Ctor()
      const source = audioCtx.createMediaStreamSource(s)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      levelBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))

      const tick = () => {
        if (!analyser || !levelBuf) return
        analyser.getByteTimeDomainData(levelBuf as Uint8Array<ArrayBuffer>)
        // RMS in 0..1, with a small gain so speech pegs closer to the top.
        let sum = 0
        for (let i = 0; i < levelBuf.length; i++) {
          const v = (levelBuf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / levelBuf.length)
        opts.onLevel?.(Math.min(1, rms * 3))
        levelRaf = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      // non-fatal — level meter is cosmetic
    }
  }

  function teardown() {
    if (levelRaf != null) cancelAnimationFrame(levelRaf)
    levelRaf = null
    try { analyser?.disconnect() } catch {}
    analyser = null
    audioCtx?.close().catch(() => {})
    audioCtx = null
    levelBuf = null
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    // Intentionally do NOT clear `chunks` here — stop() consumes them inside
    // its 'stop' event handler and calls teardown() after. cancel() clears
    // chunks explicitly.
  }

  async function start(): Promise<void> {
    if (state !== 'idle' && state !== 'error') return
    if (!isMediaRecorderSupported()) {
      const err = new Error('Voice recording is not supported on this device.')
      setState('error')
      opts.onError?.(err)
      throw err
    }
    setState('requesting')
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      const mimeType = pickMimeType()
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunks = []
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }
      recorder.onerror = (e: Event) => {
        const err = (e as unknown as { error?: Error }).error
          ?? new Error('MediaRecorder error')
        setState('error')
        opts.onError?.(err)
      }
      recorder.start()
      startTs = performance.now()
      setupLevelMeter(stream)
      setState('recording')
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      // Normalize the common "permission denied" case so callers can show a
      // focused mic-permission message.
      if (e.name === 'NotAllowedError' || /permission/i.test(e.message)) {
        e.message = 'Microphone access denied. Enable it in iOS Settings → Safari → Microphone.'
      } else if (e.name === 'NotFoundError') {
        e.message = 'No microphone was found on this device.'
      }
      setState('error')
      opts.onError?.(e)
      teardown()
      throw e
    }
  }

  function stop(): Promise<Blob> {
    if (state !== 'recording') {
      return Promise.reject(new Error('Recorder is not running'))
    }
    if (!recorder) {
      return Promise.reject(new Error('Recorder not initialised'))
    }
    const duration = performance.now() - startTs
    if (duration < minDurationMs) {
      teardown()
      chunks = []
      setState('idle')
      return Promise.reject(new Error(`Recording too short (${Math.round(duration)}ms)`))
    }
    setState('stopping')
    return new Promise<Blob>((resolve, reject) => {
      const r = recorder!
      const onStop = () => {
        r.removeEventListener('stop', onStop)
        const type = r.mimeType || 'audio/mp4'
        const blob = new Blob(chunks, { type })
        chunks = []
        teardown()
        setState('idle')
        resolve(blob)
      }
      r.addEventListener('stop', onStop, { once: true })
      try {
        r.stop()
      } catch (err) {
        r.removeEventListener('stop', onStop)
        teardown()
        setState('error')
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }

  function cancel() {
    try {
      recorder?.stop()
    } catch {
      // ignore — teardown still proceeds
    }
    chunks = []
    teardown()
    setState('idle')
  }

  function elapsedMs(): number {
    return state === 'recording' ? performance.now() - startTs : 0
  }

  return {
    get state() {
      return state
    },
    start,
    stop,
    cancel,
    elapsedMs,
  }
}
