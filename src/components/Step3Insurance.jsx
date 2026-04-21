import React from 'react'
import InputField from './InputField'

const rendaOptions = [
  'Até R$ 2.000',
  'R$ 2.001 – R$ 5.000',
  'R$ 5.001 – R$ 10.000',
  'R$ 10.001 – R$ 20.000',
  'Acima de R$ 20.000',
]

export default function Step3Insurance({ values, setValue }) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-brand-navy">Informações adicionais</h3>
        <p className="text-sm text-gray-500">Dados para personalizar suas cotações</p>
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
