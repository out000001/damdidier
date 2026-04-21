import React, { useState } from 'react'
import LoginForm    from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

const stats = [
  { value: '50k+', label: 'Clientes protegidos' },
  { value: '98%',  label: 'Satisfação' },
  { value: '24h',  label: 'Suporte' },
]

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Proteção completa',
    desc:  'Coberturas personalizadas para cada etapa da sua vida',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Cotação instantânea',
    desc:  'Receba sua proposta em minutos, sem burocracia',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Atendimento humano',
    desc:  'Especialistas disponíveis quando você precisar',
  },
]

export default function AuthPage() {
  const [mode, setMode] = useState('login')

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT: branding ─────────────────────────────────────── */}
      <div className="relative lg:w-[45%] xl:w-[42%] flex-shrink-0 bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-mid/30 blur-3xl"/>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-brand-yellow/5 blur-3xl"/>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-brand-light/20 blur-2xl"/>
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full min-h-[320px] lg:min-h-screen p-8 lg:p-10 xl:p-12 gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-yellow flex items-center justify-center shadow-yellow flex-shrink-0">
              <svg className="w-6 h-6 text-brand-navy" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
            <div>
              <span className="text-white text-xl font-black tracking-tight">DamDidier</span>
              <span className="block text-brand-yellow/80 text-xs font-semibold tracking-widest uppercase">Seguros</span>
            </div>
          </div>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-yellow/15 border border-brand-yellow/25 mb-6 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"/>
              <span className="text-brand-yellow text-xs font-semibold">Confiança há mais de 20 anos</span>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Protegendo o que<br/>
              <span className="text-brand-yellow">importa para você</span>
            </h1>
            <p className="text-white/60 text-base lg:text-lg leading-relaxed max-w-sm">
              Seguros personalizados com tecnologia de ponta e atendimento humanizado para você e sua família.
            </p>
            <div className="mt-8 space-y-4">
              {features.map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-brand-yellow flex-shrink-0 group-hover:bg-brand-yellow/20 transition-colors">
                    {icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="pt-6 border-t border-white/10">
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-brand-yellow text-2xl font-black">{value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto form-scroll">
        <div className="flex-1 flex items-start justify-center p-6 sm:p-8 lg:p-10 xl:p-14">
          <div className="w-full max-w-lg">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-white rounded-2xl shadow-card border border-gray-100 mb-8">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    mode === m ? 'bg-brand-navy text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-7 sm:p-8">
              {mode === 'login'
                ? <LoginForm    onSwitchToRegister={() => setMode('register')} />
                : <RegisterForm onSwitchToLogin={() => setMode('login')} />
              }
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              © {new Date().getFullYear()} DamDidier Seguros. Todos os direitos reservados.<br/>
              <span className="text-brand-yellow/80">SUSEP nº 12345678 — CNPJ 00.000.000/0001-00</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
