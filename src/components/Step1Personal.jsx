import React, { useEffect } from 'react'
import InputField from './InputField'
import { maskCPF, maskDate, validateCPF, validateDate } from '../utils/validators'

const sexOptions = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']
const estadoCivilOptions = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável']

export default function Step1Personal({ values, errors, touched, setValue, setError, clearError, handleBlur }) {
  function handleCPF(e) {
    const masked = maskCPF(e.target.value)
    setValue('cpf', masked)
    if (touched.cpf || masked.replace(/\D/g, '').length === 11) {
      if (!validateCPF(masked)) setError('cpf', 'CPF inválido')
      else clearError('cpf')
    }
  }

  function handleDate(e) {
    const masked = maskDate(e.target.value)
    setValue('nascimento', masked)
    if (touched.nascimento && masked.length === 10) {
      if (!validateDate(masked)) setError('nascimento', 'Data inválida')
      else clearError('nascimento')
    }
  }

  function handleName(e) {
    const v = e.target.value
    setValue('nome', v)
    if (touched.nome) {
      if (v.trim().split(' ').length < 2) setError('nome', 'Informe o nome completo')
      else clearError('nome')
    }
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-brand-navy">Dados Pessoais</h3>
        <p className="text-sm text-gray-500">Informe seus dados para identificação</p>
      </div>

      <InputField
        label="Nome completo"
        name="nome"
        value={values.nome}
        onChange={handleName}
        onBlur={handleBlur}
        placeholder="Ex: João da Silva Santos"
        error={touched.nome && errors.nome}
        success={touched.nome && !errors.nome && values.nome.length > 5 ? 'Nome válido' : ''}
        required
      />

      <InputField
        label="CPF"
        name="cpf"
        value={values.cpf}
        onChange={handleCPF}
        onBlur={handleBlur}
        placeholder="000.000.000-00"
        error={touched.cpf && errors.cpf}
        success={touched.cpf && !errors.cpf && values.cpf.length === 14 ? 'CPF válido' : ''}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Data de nascimento"
          name="nascimento"
          value={values.nascimento}
          onChange={handleDate}
          onBlur={handleBlur}
          placeholder="DD/MM/AAAA"
          error={touched.nascimento && errors.nascimento}
          success={touched.nascimento && !errors.nascimento && values.nascimento.length === 10 ? 'Válida' : ''}
          required
        />

        <div>
          <label className="label">
            Sexo<span className="text-brand-yellow ml-0.5">*</span>
          </label>
          <select
            name="sexo"
            value={values.sexo}
            onChange={e => setValue('sexo', e.target.value)}
            onBlur={handleBlur}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">Selecione</option>
            {sexOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">
          Estado civil<span className="text-brand-yellow ml-0.5">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {estadoCivilOptions.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setValue('estadoCivil', opt)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all duration-200 ${
                values.estadoCivil === opt
                  ? 'border-brand-yellow bg-brand-yellow/10 text-brand-navy'
                  : 'border-gray-200 text-gray-500 hover:border-brand-yellow/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
