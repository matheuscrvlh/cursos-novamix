import { Clock, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatarPreco } from '../../utils/formatCurrency';
import { partesData, formatHora } from '../../utils/formatDate';
import { nomeLoja } from '../../utils/lojas';

export default function CourseCard({
  id,
  curso,
  data,
  horario,
  loja,
  imagem,
  culinarista,
  duracao,
  categoria,
  valor,
  loadingVagasPorCurso,
  vagasLivres,
  vagasTotal,
  className,
  onClick
}) {
  const total = vagasTotal || 0
  const livres = vagasLivres || 0
  const ocupadas = Math.max(total - livres, 0)
  const percentual = total > 0 ? Math.min(Math.round((ocupadas / total) * 100), 100) : 0
  const esgotado = total > 0 && livres === 0
  // "últimas vagas" a partir de 20% do total livre (no mínimo 3), pra turma
  // pequena não ficar com o aviso aceso desde a primeira inscrição
  const ultimasVagas = !esgotado && total > 0 && livres <= Math.max(3, Math.ceil(total * 0.2))
  const gratuito = Number(valor) === 0

  const { dia, mes, semana } = partesData(data)
  const link = id ? `/curso/${id}` : '#'

  return (
    <article className={`group bg-white rounded-xl flex flex-col overflow-hidden ring-1 ring-chocolate/[0.07] shadow-[0_1px_2px_rgba(58,42,33,0.04)] hover:shadow-[0_28px_50px_-28px_rgba(58,42,33,0.45)] transition-shadow duration-700 ${className || ''}`}>

      <Link to={link} className="relative block aspect-4/3 overflow-hidden bg-cream-dark" tabIndex={-1} aria-hidden="true">
        {imagem ? (
          // as artes são posts 4:5 (1080×1350) — o object-position pula o
          // título "Oficina de Culinária" do topo e enquadra as fotos do
          // culinarista e do prato, o nome e a faixa de local/data da arte
          <img
            src={imagem}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover object-[center_54%] transition-transform duration-[1400ms] ease-luxo group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={44} strokeWidth={1.25} className="text-gold/50" />
          </div>
        )}

        {dia && (
          <span className="absolute top-3 left-3 flex flex-col items-center min-w-13 bg-cream/95 backdrop-blur-sm rounded-md px-2.5 pt-1.5 pb-1 shadow-sm leading-none">
            <span className="font-serif text-[26px] font-semibold text-chocolate">{dia}</span>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-orange-base mt-0.5">{mes}</span>
          </span>
        )}

        {loja && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-chocolate text-[10px] font-medium uppercase tracking-[0.18em] px-3 py-1.5 rounded-full shadow-sm">
            {nomeLoja(loja)}
          </span>
        )}

        {!loadingVagasPorCurso && (esgotado || ultimasVagas) && (
          <span className={`absolute bottom-3 left-3 text-[10px] font-medium uppercase tracking-[0.18em] px-3 py-1.5 rounded-full shadow-sm ${esgotado ? 'bg-chocolate text-cream' : 'bg-orange-base text-white'}`}>
            {esgotado ? 'Esgotado' : 'Últimas vagas'}
          </span>
        )}
      </Link>

      <div className="p-5 flex flex-col gap-3.5 flex-1">

        <div className="flex flex-col gap-1.5">
          {categoria && (
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">{categoria}</p>
          )}
          <Link to={link} className="transition-colors duration-500 hover:text-orange-base">
            <h3 className="font-serif text-chocolate text-[23px] font-semibold leading-[1.1] line-clamp-2">{curso}</h3>
          </Link>
        </div>

        <ul className="flex flex-col gap-1.5 text-[13px] font-light text-cocoa">
          <li className="flex items-center gap-2">
            <Clock size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
            <span className="truncate">
              <span className="capitalize">{semana}</span>, {formatHora(horario)}{duracao ? ` · ${duracao} de duração` : ''}
            </span>
          </li>
          {culinarista && (
            <li className="flex items-center gap-2">
              <ChefHat size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
              <span className="truncate">{culinarista}</span>
            </li>
          )}
        </ul>

        <div className="mt-auto">
          {loadingVagasPorCurso ? (
            <div className="flex flex-col gap-2 animate-pulse">
              <div className="h-2.5 w-24 rounded bg-cream-dark" />
              <div className="h-0.5 w-full rounded-full bg-cream-dark" />
            </div>
          ) : total > 0 && (
            <div className="flex flex-col gap-2">
              <p className={`text-xs ${esgotado || ultimasVagas ? 'font-medium text-orange-base' : 'font-light text-cocoa'}`}>
                {esgotado
                  ? 'Vagas esgotadas'
                  : ultimasVagas
                    ? (livres === 1 ? 'Última vaga disponível' : `Últimas ${livres} vagas`)
                    : `${livres} de ${total} vagas livres`}
              </p>
              <div className="w-full h-0.5 bg-chocolate/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-base transition-all duration-1000 ease-luxo"
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 pt-4 border-t border-chocolate/[0.07]">
          <div className="leading-none">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cocoa/70 mb-1.5">Investimento</p>
            <p className="font-serif italic text-[28px] font-semibold text-orange-base">
              {gratuito ? 'Grátis' : `R$ ${formatarPreco(valor)}`}
            </p>
          </div>

          {/* sem onClick (ex: card de prévia no admin) não tem o que o botão fazer */}
          {onClick && (
            <button
              className={`shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] px-5 py-3 rounded-full transition-colors duration-500 ${
                esgotado
                  ? 'bg-cream-dark text-cocoa/60 cursor-not-allowed'
                  : 'bg-orange-base text-white hover:bg-chocolate cursor-pointer'
              }`}
              onClick={esgotado ? undefined : onClick}
              disabled={esgotado}
            >
              {esgotado ? 'Lotado' : 'Garantir vaga'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
