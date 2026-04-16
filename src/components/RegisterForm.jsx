import React, { useState } from 'react'
import ProgressBar from './ProgressBar'
import Step1Personal from './Step1Personal'
import Step2Contact from './Step2Contact'
import Step3Insurance from './Step3Insurance'
import Step4Account from './Step4Account'
import { useForm } from '../hooks/useForm'
import { validateCPF, validateEmail, validatePassword, validateDate } from '../utils/validators'

const INITIAL = {
  // step 1
  nome: '', cpf: '', nascimento: '', sexo: '', estadoCivil: '',
  // step 2
  email: '', telefone: '', whatsapp: '',
  cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '',
  // step 3
  tipoSeguro: [], profissao: '', renda: '', possuiSeguro: '', seguradoraAtual: '',
  // step 4
  senha: '', confirmarSenha: '', aceiteLGPD: false, receberOfertas: false,
}

function validateStep(step, values) {
  const errs = {}
  if (step === 1) {
    if (!values.nome || values.nome.trim().split(' ').length < 2) errs.nome = 'Informe o nome completo'
    if (!validateCPF(values.cpf)) errs.cpf = 'CPF inválido'
    if (!validateDate(values.nascimento)) errs.nascimento = 'Data inválida'
    if (!values.sexo) errs.sexo = 'Selecione o sexo'
    if (!values.estadoCivil) errs.estadoCivil = 'Selecione o estado civil'
  }
  if (step === 2) {
    if (!validateEmail(values.email)) errs.email = 'Email inválido'
    if (!values.telefone) errs.telefone = 'Informe o telefone'
    if (!values.cep || values.cep.replace(/\D/g,'').length !== 8) errs.cep = 'CEP inválido'
    if (!values.rua) errs.rua = 'Informe a rua'
    if (!values.numero) errs.numero = 'Informe o número'
    if (!values.bairro) errs.bairro = 'Informe o bairro'
    if (!values.cidade) errs.cidade = 'Informe a cidade'
    if (!values.estado) errs.estado = 'Selecione o estado'
  }
  if (step === 3) {
    if (!values.tipoSeguro || values.tipoSeguro.length === 0) errs.tipoSeguro = 'Selecione ao menos um tipo de seguro'
  }
  if (step === 4) {
    if (!validatePassword(values.senha)) errs.senha = 'Mínimo 8 caracteres'
    if (values.senha !== values.confirmarSenha) errs.confirmarSenha = 'As senhas não coincidem'
    if (!values.aceiteLGPD) errs.aceiteLGPD = 'Aceite os termos para continuar'
  }
  return errs
}

export default function RegisterForm({ onSwitchToLogin }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const { values, errors, touched, setValue, setError, clearError, handleBlur, setErrors } = useForm(INITIAL)

  function touchAll(stepNum) {
    const fields = {
      1: ['nome', 'cpf', 'nascimento', 'sexo', 'estadoCivil'],
      2: ['email', 'telefone', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'],
      3: ['tipoSeguro'],
      4: ['senha', 'confirmarSenha', 'aceiteLGPD'],
    }
    return fields[stepNum] || []
  }

  function handleNext() {
    const stepErrors = validateStep(step, values)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setStep(s => s - 1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const stepErrors = validateStep(4, values)
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return }
    setLoading(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao criar conta')
      setSuccess(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-brand-yellow/10 flex items-center justify-center mx-auto border-4 border-brand-yellow/30 shadow-yellow">
          <svg className="w-10 h-10 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-brand-navy">Conta criada com sucesso!</h3>
          <p className="text-sm text-gray-500 mt-1">
            Bem-vindo(a), <span className="font-semibold">{values.nome.split(' ')[0]}</span>! Sua cotação está sendo preparada.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30">
          <p className="text-sm font-semibold text-brand-navy">🎉 Próximos passos</p>
          <p className="text-xs text-gray-600 mt-1">Verifique seu email <strong>{values.email}</strong> para confirmar sua conta e receber sua cotação personalizada.</p>
        </div>
        <button onClick={onSwitchToLogin} className="btn-primary">
          Ir para o login
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-brand-navy">Criar conta</h3>
          <p className="text-xs text-gray-500">Já tem conta?{' '}
            <button onClick={onSwitchToLogin} className="text-brand-yellow font-semibold hover:text-brand-yellow-dark transition-colors">
              Entrar
            </button>
          </p>
        </div>
      </div>

      <ProgressBar currentStep={step} totalSteps={4} />

      {submitError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {submitError}
        </div>
      )}

      <form onSubmit={step === 4 ? handleSubmit : e => { e.preventDefault(); handleNext() }}>
        {step === 1 && (
          <Step1Personal values={values} errors={errors} touched={touched} setValue={setValue} setError={setError} clearError={clearError} handleBlur={handleBlur} />
        )}
        {step === 2 && (
          <Step2Contact values={values} errors={errors} touched={touched} setValue={setValue} setError={setError} clearError={clearError} handleBlur={handleBlur} />
        )}
        {step === 3 && (
          <Step3Insurance values={values} errors={errors} touched={touched} setValue={setValue} handleBlur={handleBlur} />
        )}
        {step === 4 && (
          <Step4Account values={values} errors={errors} touched={touched} setValue={setValue} setError={setError} clearError={clearError} handleBlur={handleBlur} />
        )}

        <div className={`flex gap-3 mt-6 ${step > 1 ? 'flex-row' : ''}`}>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-shrink-0 py-3.5 px-5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-navy/30 hover:text-brand-navy transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Voltar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
            {step < 4 ? (
              <>
                Continuar
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            ) : 'Criar minha conta'}
          </button>
        </div>
      </form>
    </div>
  )
}
