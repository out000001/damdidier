import React, { useState } from 'react'
import InputField from './InputField'
import { maskPhone, maskCEP, fetchAddressByCEP, validateEmail } from '../utils/validators'

export default function Step2Contact({ values, errors, touched, setValue, setError, clearError, handleBlur }) {
  const [cepLoading, setCepLoading] = useState(false)

  function handleEmail(e) {
    const v = e.target.value
    setValue('email', v)
    if (touched.email) {
      if (!validateEmail(v)) setError('email', 'Email inválido')
      else clearError('email')
    }
  }

  function handlePhone(e) {
    setValue('telefone', maskPhone(e.target.value))
  }

  function handleWhatsApp(e) {
    setValue('whatsapp', maskPhone(e.target.value))
  }

  async function handleCEP(e) {
    const masked = maskCEP(e.target.value)
    setValue('cep', masked)
    clearError('cep')
    if (masked.replace(/\D/g, '').length === 8) {
      setCepLoading(true)
      const addr = await fetchAddressByCEP(masked)
      setCepLoading(false)
      if (addr) {
        setValue('rua', addr.rua)
        setValue('bairro', addr.bairro)
        setValue('cidade', addr.cidade)
        setValue('estado', addr.estado)
      } else {
        setError('cep', 'CEP não encontrado')
      }
    }
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-brand-navy">Contato & Endereço</h3>
        <p className="text-sm text-gray-500">Como podemos entrar em contato com você</p>
      </div>

      <InputField
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleEmail}
        onBlur={handleBlur}
        placeholder="seu@email.com"
        error={touched.email && errors.email}
        success={touched.email && !errors.email && values.email ? 'Email válido' : ''}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Telefone"
          name="telefone"
          value={values.telefone}
          onChange={handlePhone}
          onBlur={handleBlur}
          placeholder="(00) 0000-0000"
          required
        />
        <InputField
          label="WhatsApp"
          name="whatsapp"
          value={values.whatsapp}
          onChange={handleWhatsApp}
          onBlur={handleBlur}
          placeholder="(00) 00000-0000"
        />
      </div>

      {/* Address section */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Endereço</p>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="col-span-2">
            <InputField
              label="CEP"
              name="cep"
              value={values.cep}
              onChange={handleCEP}
              onBlur={handleBlur}
              placeholder="00000-000"
              error={touched.cep && errors.cep}
              hint="Preenchimento automático"
              required
            />
          </div>
          <div className="flex items-end">
            {cepLoading && (
              <div className="w-full py-3 flex items-center justify-center text-brand-yellow">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        <InputField
          label="Rua / Logradouro"
          name="rua"
          value={values.rua}
          onChange={e => setValue('rua', e.target.value)}
          placeholder="Rua, Av., Travessa..."
          required
        />

        <div className="grid grid-cols-3 gap-3 mt-3">
          <InputField
            label="Número"
            name="numero"
            value={values.numero}
            onChange={e => setValue('numero', e.target.value)}
            placeholder="Nº"
            required
          />
          <div className="col-span-2">
            <InputField
              label="Bairro"
              name="bairro"
              value={values.bairro}
              onChange={e => setValue('bairro', e.target.value)}
              placeholder="Bairro"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <InputField
            label="Cidade"
            name="cidade"
            value={values.cidade}
            onChange={e => setValue('cidade', e.target.value)}
            placeholder="Cidade"
            required
          />
          <div>
            <label className="label">Estado<span className="text-brand-yellow ml-0.5">*</span></label>
            <select
              name="estado"
              value={values.estado}
              onChange={e => setValue('estado', e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">UF</option>
              {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
