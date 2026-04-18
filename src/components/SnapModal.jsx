import { useState, useRef } from 'react'
import { analyzeMealImages } from '../lib/gemini'

function ImageDropZone({ label, sublabel, file, onFile, accept = 'image/*' }) {
  const inputRef   = useRef(null)
  const preview    = file ? URL.createObjectURL(file) : null

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith('image/')) onFile(dropped)
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-40 cursor-pointer transition-colors
        ${file ? 'border-lemon-400/60 bg-lemon-400/5' : 'border-navy-600 hover:border-navy-400 bg-navy-900/50'}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />

      {preview ? (
        <>
          <img src={preview} alt="preview" className="h-full w-full object-cover rounded-xl opacity-80" />
          <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-navy-950/80 to-transparent rounded-xl">
            <span className="text-white text-xs font-medium">{file.name}</span>
          </div>
          <button
            className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
            onClick={e => { e.stopPropagation(); onFile(null) }}
            aria-label="Remove image"
          >
            ×
          </button>
        </>
      ) : (
        <>
          <span className="text-3xl mb-1">{label}</span>
          <span className="text-navy-300 text-sm font-medium">{sublabel}</span>
          <span className="text-navy-500 text-xs mt-0.5">Tap to upload or drag & drop</span>
        </>
      )}
    </div>
  )
}

function ResultPreview({ data }) {
  return (
    <div className="card bg-navy-900 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-bold">{data.description}</h3>
          {data.identified_foods?.length > 0 && (
            <p className="text-navy-400 text-xs mt-0.5">{data.identified_foods.join(', ')}</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-lemon-400 font-bold text-xl">{data.calories}</span>
          <span className="text-navy-400 text-xs"> kcal</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Carbs',   value: data.carbs,   color: 'text-lemon-400' },
          { label: 'Protein', value: data.protein, color: 'text-sky-400'   },
          { label: 'Fat',     value: data.fat,     color: 'text-pink-400'  },
          { label: 'Fiber',   value: data.fiber,   color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-navy-800 rounded-lg py-2 px-1">
            <p className={`font-bold text-sm ${color}`}>{Math.round(value)}g</p>
            <p className="text-navy-400 text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {data.labels_detected && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
            ✓ Label detected
          </span>
        )}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize
          ${data.confidence === 'high'   ? 'bg-emerald-500/20 text-emerald-400' :
            data.confidence === 'medium' ? 'bg-lemon-400/20  text-lemon-400'   :
                                           'bg-red-500/20    text-red-400'}`}>
          {data.confidence} confidence
        </span>
      </div>

      {data.notes && (
        <p className="text-navy-400 text-xs italic">{data.notes}</p>
      )}
    </div>
  )
}

export default function SnapModal({ onClose, onSave }) {
  const [foodFile,  setFoodFile]  = useState(null)
  const [labelFile, setLabelFile] = useState(null)
  const [result,    setResult]    = useState(null)
  const [status,    setStatus]    = useState('idle') // idle | analyzing | error | done
  const [errorMsg,  setErrorMsg]  = useState('')

  const canAnalyze = foodFile && status !== 'analyzing'
  const apiKeySet  = Boolean(import.meta.env.VITE_GEMINI_API_KEY)

  async function handleAnalyze() {
    if (!foodFile) return
    setStatus('analyzing')
    setErrorMsg('')
    setResult(null)

    try {
      const data = await analyzeMealImages(foodFile, labelFile)
      setResult(data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message ?? 'Analysis failed. Check your API key.')
      setStatus('error')
    }
  }

  async function handleSave() {
    if (!result) return
    await onSave(result)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-navy-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-white font-bold text-lg">Snap & Track</h2>
          <button onClick={onClose} className="btn-ghost text-xl leading-none">×</button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {!apiKeySet && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              ⚠️ <strong>VITE_GEMINI_API_KEY</strong> is not set. Create a <code className="text-red-300">.env</code> file from <code className="text-red-300">.env.example</code> and restart the dev server.
            </div>
          )}

          {/* Photo zones */}
          <div className="flex flex-col gap-3">
            <ImageDropZone
              label="📸"
              sublabel="Food photo (required)"
              file={foodFile}
              onFile={setFoodFile}
            />
            <ImageDropZone
              label="🏷️"
              sublabel="Label / barcode (optional)"
              file={labelFile}
              onFile={setLabelFile}
            />
          </div>

          {/* Hint */}
          <p className="text-navy-400 text-xs text-center -mt-1">
            Include your hand for better portion estimation
          </p>

          {/* Analyze button */}
          {status !== 'done' && (
            <button
              className="btn-primary w-full py-4 text-base"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
            >
              {status === 'analyzing' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Analyzing…
                </span>
              ) : 'Analyze Meal'}
            </button>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {errorMsg}
              <button className="block mt-2 text-red-300 underline text-xs" onClick={() => setStatus('idle')}>
                Try again
              </button>
            </div>
          )}

          {/* Result */}
          {result && (
            <>
              <ResultPreview data={result} />
              <div className="flex gap-3">
                <button
                  className="flex-1 border border-navy-600 text-navy-300 hover:text-white hover:border-navy-400 rounded-xl py-3 font-semibold transition-colors text-sm"
                  onClick={() => { setResult(null); setStatus('idle') }}
                >
                  Re-analyze
                </button>
                <button className="btn-primary flex-1 py-3 text-sm" onClick={handleSave}>
                  Log Meal ✓
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
