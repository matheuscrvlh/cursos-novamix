import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatarPreco } from '../../utils/formatCurrency';

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
  vagasReservadas,
  className,
  onClick
}) {
  const total = vagasReservadas || 0
  const ocupadas = Math.max(total - (vagasLivres || 0), 0)
  const percentual = total > 0 ? Math.min(Math.round((ocupadas / total) * 100), 100) : 0
  const esgotado = total > 0 && ocupadas >= total

  return (
    <div className={`bg-white rounded-xl flex flex-col shadow-md hover:shadow-lg transition-shadow md:min-w-75 ${className || ''}`}>

      <div className="relative rounded-t-xl h-48 w-full overflow-hidden">
        {imagem ? (
          <img src={imagem} alt={curso} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-base/10 flex items-center justify-center">
            <User size={40} className="text-gray-base/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

        <span className="absolute bottom-3 left-3 bg-orange-base text-white text-sm font-bold px-3 py-1 rounded-full shadow">
          R$ {formatarPreco(valor)}
        </span>

        {loja === 'Prado'
          ? <span className="absolute top-3 right-3 bg-orange-base text-white text-xs font-semibold px-2.5 py-1 rounded-full">Prado</span>
          : <span className="absolute top-3 right-3 bg-blue-base text-white text-xs font-semibold px-2.5 py-1 rounded-full">{loja}</span>
        }
      </div>

      <Link to={id ? `/curso/${id}` : '#'} className="hover:text-orange-base transition">
        <h2 className="text-gray-dark font-bold text-lg px-4 pt-4 pb-2 line-clamp-2 leading-snug">
          {curso}
        </h2>
      </Link>

      <div className="px-4 pb-4 flex flex-col gap-2 mt-auto">

        <div className="flex items-center gap-2 text-sm text-gray-text/70">
          <Calendar size={14} className="shrink-0 text-orange-base" />
          <span>{data} às {horario}h</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-text/70">
          <Clock size={14} className="shrink-0 text-orange-base" />
          <span>{duracao}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-text/70">
          <User size={14} className="shrink-0 text-orange-base" />
          <span className="truncate">{culinarista}</span>
        </div>

        <div className="mt-1">
          {loadingVagasPorCurso ? (
            <span className="text-xs text-gray-text/50">Carregando vagas...</span>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-gray-text/60">
                <span>{esgotado ? 'Vagas esgotadas' : `${vagasLivres} vaga${vagasLivres === 1 ? '' : 's'} livre${vagasLivres === 1 ? '' : 's'}`}</span>
                <span className="font-semibold text-gray-dark">{percentual}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-base/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${esgotado ? 'bg-red-base' : 'bg-orange-base'}`}
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          className={`mt-2 font-semibold text-sm py-2.5 rounded-lg w-full transition-all ${
            esgotado
              ? 'bg-gray-base/20 text-gray-text/50 cursor-not-allowed'
              : 'bg-orange-base text-white hover:bg-orange-light hover:shadow-md cursor-pointer'
          }`}
          onClick={esgotado ? undefined : (onClick || undefined)}
          disabled={esgotado}
        >
          {esgotado ? 'Curso lotado' : 'Garantir minha vaga'}
        </button>
      </div>
    </div>
  );
}
