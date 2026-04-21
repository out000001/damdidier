import React, { useState } from 'react'
import InputField from './InputField'
import { validateEmail } from '../utils/validators'

export default function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [lembrar, setLembrar] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')

  function handleEmailChange(e) {
    const v = e.target.value
    setEmail(v)
    if (v && !validateEmail(v)) setEmailError('Email inválido')
    else setEmailError('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!validateEmail(email)) { setEmailError('Email inválido'); return }
    if (!senha) { setError('Informe sua senha'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Credenciais inválidas')
      if (lembrar) localStorage.setItem('token', data.token)
      else sessionStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    if (!validateEmail(forgotEmail)) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setForgotSent(true)
    setLoading(false)
  }

  if (forgotMode) {
    return (
      <div className="animate-slide-up">
        <button
          type="button"
          onClick={() => { setForgotMode(false); setForgotSent(false) }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-navy mb-6 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar ao login
        </button>

        <h3 className="text-lg font-bold text-brand-navy mb-1">Recuperar senha</h3>
        <p className="text-sm text-gray-500 mb-6">Enviaremos um link para o seu email</p>

        {forgotSent ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-brand-navy">Email enviado!</p>
            <p className="text-sm text-gray-500">Verifique sua caixa de entrada em <span className="font-medium">{forgotEmail}</span></p>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <InputField
              label="Email cadastrado"
              name="forgotEmail"
              type="email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : null}
              Enviar link de recuperação
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold text-brand-navy mb-1">Bem-vindo de volta</h3>
      <p className="text-sm text-gray-500 mb-6">Acesse sua conta para gerenciar seus seguros</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm animate-slide-up">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <InputField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="seu@email.com"
          error={emailError}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Senha<span className="text-brand-yellow ml-0.5">*</span></label>
            <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-brand-yellow hover:text-brand-yellow-dark font-semibold transition-colors">
              Esqueci a senha
            </button>
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              name="senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Sua senha"
              className="input-field pr-10"
            />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)} className="w-4 h-4 accent-brand-yellow cursor-pointer" />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Lembrar login</span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : null}
          Entrar na conta
        </button>

      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Não tem conta?{' '}
        <button onClick={onSwitchToRegister} className="text-brand-yellow font-bold hover:text-brand-yellow-dark transition-colors">
          Cadastre-se grátis
        </button>
      </p>
    </div>
  )
}
