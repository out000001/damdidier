import React from 'react'

const steps = ['Pessoal', 'Contato', 'Endereço', 'Seguro']

export default function ProgressBar({ currentStep, totalSteps = 4 }) {
  const pct = Math.round(((currentStep) / totalSteps) * 100)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Etapa {currentStep} de {totalSteps}
        </span>
        <span className="text-xs font-bold text-brand-yellow">
          {pct}% completo
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #F5C518 0%, #D4A800 100%)',
          }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {steps.map((label, i) => {
          const stepNum = i + 1
          const done = stepNum < currentStep
          const active = stepNum === currentStep
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? 'bg-brand-yellow text-brand-navy shadow-yellow'
                    : active
                    ? 'bg-brand-yellow text-brand-navy shadow-yellow scale-110'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-brand-navy' : done ? 'text-brand-yellow' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
