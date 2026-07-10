import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <div className={`bg-white rounded-xl flex flex-col shadow-md hover:shadow-lg transition-shadow md:min-w-75 ${className || ''}`}>

      {/* IMAGEM */}
      <div className="relative rounded-t-xl h-48 w-full overflow-hidden">
        {imagem ? (
          <img src={imagem} alt={curso} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-base/10 flex items-center justify-center">
            <User size={40} className="text-gray-base/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

        {/* Valor badge — base esquerda */}
        <span className="absolute bottom-3 left-3 bg-orange-base text-white text-sm font-bold px-3 py-1 rounded-full shadow">
          R$ {valor}
        </span>

        {/* Loja badge — topo direito */}
        {loja === 'Prado'
          ? <span className="absolute top-3 right-3 bg-orange-base text-white text-xs font-semibold px-2.5 py-1 rounded-full">Prado</span>
          : <span className="absolute top-3 right-3 bg-blue-base text-white text-xs font-semibold px-2.5 py-1 rounded-full">{loja}</span>
        }
      </div>

      {/* TÍTULO */}
      <Link to={id ? `/curso/${id}` : '#'} className="hover:text-orange-base transition">
        <h2 className="text-gray-dark font-bold text-lg px-4 pt-4 pb-2 line-clamp-2 leading-snug">
          {curso}
        </h2>
      </Link>

      {/* INFOS */}
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

        {/* Vagas */}
        <div className="text-xs text-gray-text/50 mt-1">
          {loadingVagasPorCurso
            ? <span>Carregando vagas...</span>
            : <span>Vagas: <span className="font-semibold text-gray-dark">{vagasLivres}/{vagasReservadas}</span></span>
          }
        </div>

        {/* BOTÃO */}
        <button
          className="mt-2 bg-orange-base text-white font-semibold text-sm py-2.5 rounded-lg w-full hover:bg-orange-light hover:shadow-md transition-all cursor-pointer"
          onClick={onClick || undefined}
        >
          Garantir minha vaga
        </button>
      </div>
    </div>
  );
}
