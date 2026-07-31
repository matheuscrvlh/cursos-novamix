import { useEffect, useState } from "react"

import { X } from "lucide-react"

import Input from "../../Input"
import Button from "../../Button"
import useBodyScrollLock from "../../../hooks/useBodyScrollLock"

function maskCPF(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// o +55 é fixo na tela (fora do campo) — aqui só mascara DDD + número, sem
// pedir o código do país, que era o que a maioria dos clientes esquecia
function maskPhoneLocal(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    const ddd = digits.slice(0, 2);
    const resto = digits.slice(2);
    if (resto.length <= 4) return `(${ddd}) ${resto}`;
    // celular tem 9 digitos (corta 5+4), fixo tem 8 (corta 4+4)
    const corte = resto.length > 8 ? 5 : 4;
    return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

function semPrefixo(celular) {
    return (celular || '').replace(/^\+55\s?/, '');
}

function isCPFValid(cpf) {
    return (cpf || '').replace(/\D/g, '').length === 11;
}

function isPhoneValid(phone) {
    const digits = semPrefixo(phone).replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
}

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

export default function ModalEnrollmentForm({
    isOpen,
    onClick,
    onClose,
    enrollment,
    setEnrollment,
    ...props
}) {
    const [submitted, setSubmitted] = useState(false);

    useBodyScrollLock(isOpen)

    useEffect(() => {
        if (!isOpen) setSubmitted(false)
    }, [isOpen])

    if (!isOpen) return null

    const erroNome     = submitted && !enrollment.nome.trim();
    const erroCPF      = submitted && !isCPFValid(enrollment.cpf);
    const erroTelefone = submitted && !isPhoneValid(enrollment.celular);
    const erroEmail    = submitted && !isEmailValid(enrollment.email);

    function handleSubmit() {
        setSubmitted(true);
        if (
            !enrollment.nome.trim() ||
            !isCPFValid(enrollment.cpf) ||
            !isPhoneValid(enrollment.celular) ||
            !isEmailValid(enrollment.email)
        ) return;
        onClick();
    }

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-xl rounded-xl w-[90%] max-w-115 max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <div className='flex items-center justify-between p-5 pb-4 border-b border-gray-base/20'>
                    <div>
                        <h2 className='font-bold text-gray-dark text-lg'>Suas informações</h2>
                        <p className='text-xs text-gray-text/60 mt-0.5'>Preencha os dados para garantir sua vaga</p>
                    </div>
                    <button
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray text-gray-text/60 hover:text-gray-dark transition cursor-pointer'
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className='flex flex-col gap-4 p-5'>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>Nome completo</label>
                        <Input
                            type='text'
                            placeholder='Seu nome'
                            value={enrollment.nome}
                            className={`w-full ${erroNome ? 'ring-1 ring-red-base' : ''}`}
                            autoComplete='name'
                            onChange={e => setEnrollment({ ...enrollment, nome: e.target.value })}
                        />
                        {erroNome && <p className='text-red-base text-xs'>Preencha seu nome completo</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>CPF</label>
                        <Input
                            type='text'
                            placeholder='000.000.000-00'
                            value={enrollment.cpf}
                            className={`w-full ${erroCPF ? 'ring-1 ring-red-base' : ''}`}
                            inputMode='numeric'
                            maxLength={14}
                            autoComplete='off'
                            onChange={e => setEnrollment({ ...enrollment, cpf: maskCPF(e.target.value) })}
                        />
                        {erroCPF && <p className='text-red-base text-xs'>CPF incompleto — preencha os 11 dígitos</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>Telefone</label>
                        <div className={`flex items-stretch gap-2 ${erroTelefone ? 'ring-1 ring-red-base rounded-md' : ''}`}>
                            <span className='shrink-0 flex items-center gap-1 px-3 border border-gray-base rounded-md text-gray-text/70 text-sm font-medium bg-gray/40'>
                                🇧🇷 +55
                            </span>
                            <Input
                                type='tel'
                                placeholder='(21) 99999-9999'
                                value={semPrefixo(enrollment.celular)}
                                className='w-full'
                                inputMode='numeric'
                                maxLength={15}
                                autoComplete='tel-national'
                                onChange={e => {
                                    const local = maskPhoneLocal(e.target.value)
                                    setEnrollment({ ...enrollment, celular: local ? `+55 ${local}` : '' })
                                }}
                            />
                        </div>
                        {erroTelefone && <p className='text-red-base text-xs'>Telefone incompleto — inclua DDD e número</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>E-mail</label>
                        <Input
                            type='email'
                            placeholder='seu@email.com'
                            value={enrollment.email}
                            className={`w-full ${erroEmail ? 'ring-1 ring-red-base' : ''}`}
                            autoComplete='email'
                            onChange={e => setEnrollment({ ...enrollment, email: e.target.value })}
                        />
                        {erroEmail && <p className='text-red-base text-xs'>Informe um e-mail válido</p>}
                    </div>

                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-2 font-semibold'
                        onClick={handleSubmit}
                    >
                        Confirmar inscrição
                    </Button>

                    <p className='text-center text-xs text-gray-text/50 mt-1'>
                        Reembolso somente antes de 24h do início do curso.
                    </p>

                </div>
            </div>
        </div>
    )
}
