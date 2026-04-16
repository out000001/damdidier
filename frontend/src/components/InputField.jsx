import React from 'react'

export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  success,
  hint,
  required,
  children,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const state = error ? 'error' : success ? 'success' : ''

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && <span className="text-brand-yellow ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {children ? (
          children
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`input-field ${state} ${inputClassName}`}
            aria-invalid={!!error}
            {...rest}
          />
        )}
        {!children && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {error && (
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            )}
            {success && !error && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            )}
          </span>
        )}
      </div>
      {error && <p className="field-error"><span>⚠</span>{error}</p>}
      {success && !error && <p className="field-success"><span>✓</span>{success}</p>}
      {hint && !error && !success && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
