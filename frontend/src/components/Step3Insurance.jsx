import React from 'react'
import InputField from './InputField'

const insuranceTypes = [
  {
    id: 'auto',
    label: 'Auto',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    id: 'vida',
    label: 'Vida',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    id: 'residencial',
    label: 'Residencial',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    id: 'empresarial',
    label: 'Empresarial',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
]

const rendaOptions = [
  'Até R$ 2.000',
  'R$ 2.001 – R$ 5.000',
  'R$ 5.001 – R$ 10.000',
  'R$ 10.001 – R$ 20.000',
  'Acima de R$ 20.000',
]

export default function Step3Insurance({ values, errors, touched, setValue, handleBlur }) {
  function toggleInsurance(id) {
    const current = values.tipoSeguro || []
    const next = current.includes(id) ? current.filter(t => t !== id) : [...current, id]
    setValue('tipoSeguro', next)
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-brand-navy">Interesse em Seguros</h3>
        <p className="text-sm text-gray-500">Selecione os produtos de interesse</p>
      </div>

      {/* Insurance type cards */}
      <div>
        <label className="label">Tipo de seguro desejado<span className="text-brand-yellow ml-0.5">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {insuranceTypes.map(({ id, label, icon }) => {
            const selected = (values.tipoSeguro || []).includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleInsurance(id)}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                  selected
                    ? 'border-brand-yellow bg-gradient-to-b from-brand-yellow/10 to-brand-yellow/5 text-brand-navy shadow-yellow'
                    : 'border-gray-200 text-gray-400 hover:border-brand-yellow/40 hover:text-brand-navy'
                }`}
              >
                <div className={selected ? 'text-brand-yellow' : ''}>{icon}</div>
                <span className={`text-xs font-bold ${selected ? 'text-brand-navy' : 'text-gray-500'}`}>{label}</span>
                {selected && (
                  <div className="w-4 h-4 rounded-full bg-brand-yellow flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-brand-navy" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <InputField
        label="Profissão"
        name="profissao"
        value={values.profissao}
        onChange={e => setValue('profissao', e.target.value)}
        placeholder="Ex: Engenheiro, Professor, Médico..."
      />

      <div>
        <label className="label">Renda mensal</label>
        <select
          name="renda"
          value={values.renda}
          onChange={e => setValue('renda', e.target.value)}
          className="input-field appearance-none cursor-pointer"
        >
          <option value="">Selecione a faixa de renda</option>
          {rendaOptions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seguros atuais</p>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 flex-1">Possui outros seguros?</label>
          <div className="flex gap-2">
            {['Sim', 'Não'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setValue('possuiSeguro', opt)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                  values.possuiSeguro === opt
                    ? 'border-brand-yellow bg-brand-yellow text-brand-navy'
                    : 'border-gray-200 text-gray-400 hover:border-brand-yellow/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {values.possuiSeguro === 'Sim' && (
          <InputField
            label="Seguradora atual"
            name="seguradoraAtual"
            value={values.seguradoraAtual}
            onChange={e => setValue('seguradoraAtual', e.target.value)}
            placeholder="Nome da seguradora"
            className="animate-slide-up"
          />
        )}
      </div>
    </div>
  )
}
