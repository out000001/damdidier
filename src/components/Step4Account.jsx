import React, { useState } from 'react'
import InputField from './InputField'
import { validateEmail, validatePassword } from '../utils/validators'

export default function Step4Account({ values, errors, touched, setValue, setError, clearError, handleBlur }) {
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const pwStrength = (() => {
    const pw = values.senha || ''
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  })()

  const strengthLabels = ['', 'Fraca', 'Regular', 'Boa', 'Forte']
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']

  function handleSenha(e) {
    const v = e.target.value
    setValue('senha', v)
    if (!validatePassword(v)) setError('senha', 'Mínimo 8 caracteres')
    else clearError('senha')
    if (values.confirmarSenha && v !== values.confirmarSenha) setError('confirmarSenha', 'As senhas não coincidem')
    else if (values.confirmarSenha) clearError('confirmarSenha')
  }

  function handleConfirmar(e) {
    const v = e.target.value
    setValue('confirmarSenha', v)
    if (v !== values.senha) setError('confirmarSenha', 'As senhas não coincidem')
    else clearError('confirmarSenha')
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-brand-navy">Criar sua conta</h3>
        <p className="text-sm text-gray-500">Defina sua senha de acesso</p>
      </div>

      <div>
        <label className="label">Senha<span className="text-brand-yellow ml-0.5">*</span></label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            name="senha"
            value={values.senha}
            onChange={handleSenha}
            onBlur={handleBlur}
            placeholder="Mínimo 8 caracteres"
            className={`input-field pr-10 ${errors.senha && touched.senha ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {/* Strength bar */}
        {values.senha && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1,2,3,4].map(n => (
                <div key={n} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${n <= pwStrength ? strengthColors[pwStrength] : 'bg-gray-200'}`}/>
              ))}
            </div>
            <p className={`text-xs font-medium ${pwStrength <= 1 ? 'text-red-500' : pwStrength === 2 ? 'text-yellow-600' : pwStrength === 3 ? 'text-blue-600' : 'text-green-600'}`}>
              Senha {strengthLabels[pwStrength]}
            </p>
          </div>
        )}
        {touched.senha && errors.senha && <p className="field-error"><span>⚠</span>{errors.senha}</p>}
      </div>

      <div>
        <label className="label">Confirmar senha<span className="text-brand-yellow ml-0.5">*</span></label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmarSenha"
            value={values.confirmarSenha}
            onChange={handleConfirmar}
            onBlur={handleBlur}
            placeholder="Repita a senha"
            className={`input-field pr-10 ${errors.confirmarSenha && touched.confirmarSenha ? 'error' : !errors.confirmarSenha && values.confirmarSenha && values.confirmarSenha === values.senha ? 'success' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        {touched.confirmarSenha && errors.confirmarSenha && <p className="field-error"><span>⚠</span>{errors.confirmarSenha}</p>}
        {!errors.confirmarSenha && values.confirmarSenha && values.confirmarSenha === values.senha && (
          <p className="field-success"><span>✓</span>Senhas coincidem</p>
        )}
      </div>

      {/* LGPD */}
      <div className="p-4 rounded-xl bg-brand-navy/5 border border-brand-navy/10 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-navy mb-1">Proteção de dados — LGPD</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Seus dados são protegidos conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Utilizamos seus dados exclusivamente para cotações e contato relacionados aos serviços solicitados.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-2 cursor-pointer group">
          <input
            type="checkbox"
            name="aceiteLGPD"
            checked={values.aceiteLGPD}
            onChange={e => setValue('aceiteLGPD', e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand-yellow cursor-pointer"
          />
          <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
            Li e aceito a <span className="text-brand-yellow font-semibold underline cursor-pointer">Política de Privacidade</span> e os <span className="text-brand-yellow font-semibold underline cursor-pointer">Termos de Uso</span>
          </span>
        </label>

        <label className="flex items-start gap-2 cursor-pointer group">
          <input
            type="checkbox"
            name="receberOfertas"
            checked={values.receberOfertas}
            onChange={e => setValue('receberOfertas', e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand-yellow cursor-pointer"
          />
          <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
            Aceito receber ofertas e novidades por email e WhatsApp
          </span>
        </label>
      </div>
    </div>
  )
}
