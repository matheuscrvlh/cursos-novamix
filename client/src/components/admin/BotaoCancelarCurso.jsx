import { useContext, useState } from 'react'
import { Ban, RotateCcw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

import Button from '../Button'
import Tooltip from './Tooltip'
import { DadosContext } from '../../contexts/DadosContext'
import { AdminAuthContext } from '../../contexts/AdminAuthContext'
import { getEnrollment } from '../../api/enrollment.services'
import { cursoEncerrado, formatDateBR } from '../../utils/formatDate'

// selo ao lado do nome do curso nas listas do painel
export function SeloCancelado() {
    return (
        <span className='text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-base/10 text-red-base shrink-0'>
            Cancelado
        </span>
    )
}

// Botão "Cancelar curso" (ou "Reativar", se já estiver cancelado) da lista de
// cursos do painel. Só admin do módulo vê, e só em curso que ainda não
// aconteceu. Cancelar reembolsa no Mercado Pago quem pagou e avisa todo mundo
// por e-mail (cursos.routes.js) — por isso o modal mostra antes quantas
// inscrições serão afetadas e, no fim, o resumo do que foi feito.
export default function BotaoCancelarCurso({ curso }) {
    const { cancelarCurso, reativarCurso } = useContext(DadosContext)
    const { isAdmin } = useContext(AdminAuthContext)

    // etapa: null (fechado) | 'confirmar' | 'processando' | 'resultado' | 'reativar'
    const [etapa, setEtapa] = useState(null)
    const [motivo, setMotivo] = useState('')
    const [afetadas, setAfetadas] = useState(null)
    const [resultado, setResultado] = useState(null)

    if (!isAdmin || cursoEncerrado(curso)) return null
    const cancelado = !!curso.canceladoEm

    async function abrirCancelamento() {
        setMotivo('')
        setResultado(null)
        setAfetadas(null)
        setEtapa('confirmar')
        const inscricoes = await getEnrollment(curso.id)
        const lista = Array.isArray(inscricoes) ? inscricoes : []
        setAfetadas({
            pagas: lista.filter(i => i.status === 'pago').length,
            pendentes: lista.filter(i => i.status === 'pendente').length,
        })
    }

    async function confirmarCancelamento() {
        setEtapa('processando')
        const res = await cancelarCurso(curso.id, motivo.trim())
        setResultado(res)
        setEtapa('resultado')
    }

    async function confirmarReativacao() {
        setEtapa('processando')
        const res = await reativarCurso(curso.id)
        if (res.ok) return setEtapa(null)
        setResultado(res)
        setEtapa('resultado')
    }

    const fechar = () => etapa !== 'processando' && setEtapa(null)

    return (
        <>
            {cancelado ? (
                <Tooltip label='Reativar curso'>
                    <Button className='bg-green-base p-2 hover:bg-green-base/80 text-white' onClick={() => { setResultado(null); setEtapa('reativar') }}>
                        <RotateCcw size={16} />
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Cancelar curso'>
                    <Button className='bg-gray-dark p-2 hover:bg-gray-text text-white' onClick={abrirCancelamento}>
                        <Ban size={16} />
                    </Button>
                </Tooltip>
            )}

            {etapa && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4' onClick={fechar}>
                    <div className='bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden text-left' onClick={e => e.stopPropagation()}>

                        {etapa === 'confirmar' && (
                            <>
                                <div className='p-6 flex flex-col gap-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-red-base/10 text-red-base'>
                                            <AlertTriangle size={22} />
                                        </div>
                                        <div>
                                            <h2 className='text-base font-bold text-gray-dark'>Cancelar curso</h2>
                                            <p className='text-sm text-gray-text/70'>{curso.nomeCurso} · {formatDateBR(curso.data)} às {curso.hora}</p>
                                        </div>
                                    </div>

                                    <div className='text-sm text-gray-text bg-gray/70 rounded-lg p-3 flex flex-col gap-1.5'>
                                        {afetadas === null ? (
                                            <p className='flex items-center gap-2 text-gray-text/60'><Loader2 size={14} className='animate-spin' /> Conferindo inscrições...</p>
                                        ) : (
                                            <>
                                                <p><strong>{afetadas.pagas}</strong> {afetadas.pagas === 1 ? 'inscrição paga será reembolsada' : 'inscrições pagas serão reembolsadas'} automaticamente no Mercado Pago.</p>
                                                <p><strong>{afetadas.pendentes}</strong> {afetadas.pendentes === 1 ? 'reserva não paga será cancelada' : 'reservas não pagas serão canceladas'}.</p>
                                                <p>Todos recebem um e-mail avisando do cancelamento.</p>
                                            </>
                                        )}
                                        <p>O curso continua no site com o aviso de cancelado até {formatDateBR(curso.data)} às {curso.hora}, e depois some sozinho.</p>
                                    </div>

                                    <label className='flex flex-col gap-1.5'>
                                        <span className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Motivo (opcional)</span>
                                        <textarea
                                            value={motivo}
                                            onChange={e => setMotivo(e.target.value)}
                                            maxLength={300}
                                            rows={2}
                                            placeholder='Ex: culinarista com problema de saúde'
                                            className='p-2 border border-gray-base rounded-md text-gray-text text-sm resize-none'
                                        />
                                        <span className='text-xs text-gray-text/60'>Aparece no site e no e-mail para os inscritos.</span>
                                    </label>

                                    <p className='text-xs text-red-base font-medium'>Os reembolsos não têm volta: mesmo que o curso seja reativado depois, quem foi reembolsado precisa se inscrever de novo.</p>
                                </div>

                                <div className='flex border-t border-gray-base/20'>
                                    <button onClick={fechar} className='flex-1 py-3.5 text-sm font-semibold text-gray-text hover:bg-gray transition-colors cursor-pointer'>
                                        Voltar
                                    </button>
                                    <button
                                        onClick={confirmarCancelamento}
                                        disabled={afetadas === null}
                                        className='flex-1 py-3.5 text-sm font-semibold text-white transition-colors cursor-pointer bg-red-base hover:bg-red-light disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        Cancelar curso
                                    </button>
                                </div>
                            </>
                        )}

                        {etapa === 'reativar' && (
                            <>
                                <div className='p-6 flex flex-col items-center text-center gap-3'>
                                    <div className='w-12 h-12 rounded-full flex items-center justify-center bg-green-base/15 text-green-base'>
                                        <RotateCcw size={22} />
                                    </div>
                                    <h2 className='text-base font-bold text-gray-dark'>Reativar curso</h2>
                                    <p className='text-sm text-gray-text/70 leading-relaxed'>
                                        "{curso.nomeCurso}" volta a aceitar inscrições normalmente. Quem foi reembolsado no cancelamento não volta sozinho: precisa se inscrever de novo.
                                    </p>
                                </div>
                                <div className='flex border-t border-gray-base/20'>
                                    <button onClick={fechar} className='flex-1 py-3.5 text-sm font-semibold text-gray-text hover:bg-gray transition-colors cursor-pointer'>Voltar</button>
                                    <button onClick={confirmarReativacao} className='flex-1 py-3.5 text-sm font-semibold text-white transition-colors cursor-pointer bg-green-base hover:bg-green-base/80'>Reativar</button>
                                </div>
                            </>
                        )}

                        {etapa === 'processando' && (
                            <div className='p-8 flex flex-col items-center text-center gap-3'>
                                <Loader2 size={32} className='animate-spin text-orange-base' />
                                <p className='text-sm text-gray-text'>Processando... Não feche esta janela.</p>
                                <p className='text-xs text-gray-text/60'>Cada reembolso no Mercado Pago leva alguns segundos.</p>
                            </div>
                        )}

                        {etapa === 'resultado' && resultado && (
                            <>
                                <div className='p-6 flex flex-col gap-3'>
                                    {resultado.ok ? (
                                        <>
                                            <div className='flex items-center gap-3'>
                                                <CheckCircle2 size={28} className='text-green-base shrink-0' />
                                                <h2 className='text-base font-bold text-gray-dark'>Curso cancelado</h2>
                                            </div>
                                            <ul className='text-sm text-gray-text flex flex-col gap-1'>
                                                <li>{resultado.reembolsadas} reembolso(s) feito(s) no Mercado Pago</li>
                                                <li>{resultado.reservasCanceladas} reserva(s) não paga(s) cancelada(s)</li>
                                                <li>E-mails de aviso enviados aos inscritos</li>
                                            </ul>
                                            {resultado.falhas?.length > 0 && (
                                                <div className='text-sm bg-orange-base/10 text-gray-text rounded-lg p-3 flex flex-col gap-1.5'>
                                                    <p className='font-semibold text-orange-base'>{resultado.falhas.length} reembolso(s) não puderam ser feitos agora:</p>
                                                    <ul className='list-disc pl-5'>
                                                        {resultado.falhas.map(f => <li key={f.id}><strong>{f.nome}</strong>: {f.motivo}</li>)}
                                                    </ul>
                                                    <p>Essas inscrições continuam como pagas. Faça o reembolso delas depois pela tela de Inscrições, no botão de reembolsar.</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className='flex items-center gap-3'>
                                                <AlertTriangle size={26} className='text-red-base shrink-0' />
                                                <h2 className='text-base font-bold text-gray-dark'>Não foi possível concluir</h2>
                                            </div>
                                            <p className='text-sm text-gray-text'>{resultado.message}</p>
                                        </>
                                    )}
                                </div>
                                <div className='flex border-t border-gray-base/20'>
                                    <button onClick={fechar} className='flex-1 py-3.5 text-sm font-semibold text-gray-text hover:bg-gray transition-colors cursor-pointer'>Fechar</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
