import { useState, useCallback } from 'react'

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setError = useCallback((name, message) => {
    setErrors(prev => ({ ...prev, [name]: message }))
  }, [])

  const clearError = useCallback((name) => {
    setErrors(prev => { const next = { ...prev }; delete next[name]; return next })
  }, [])

  const touch = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValue(name, type === 'checkbox' ? checked : value)
  }, [setValue])

  const handleBlur = useCallback((e) => {
    touch(e.target.name)
  }, [touch])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, errors, touched, setValue, setError, clearError, touch, handleChange, handleBlur, reset, setErrors }
}
