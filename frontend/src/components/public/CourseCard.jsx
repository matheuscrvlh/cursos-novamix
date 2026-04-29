export default function CourseCard({
  curso,
  data,
  horario,
  loja,
  imagem,
  culinarista,
  duracao,
  categoria,
  valor,
  vagasLivres,
  vagasReservadas,
  className = '',
  onClick
}) {
  return (
    <div
      className={`bg-white w-75 max-w-150 rounded-xl min-h-[380px] max-h-[550px] flex flex-col shadow-md
        md:min-w-[300px]
        hover:shadow-lg transition-shadow
        ${className}
      `}
    >
      {/* IMAGEM */}
      <div className="relative rounded-t-xl h-[200px] overflow-hidden">
        <p
          className="
            absolute top-2 right-2 bg-orange-base text-white rounded-md px-2 py-1 mx-auto text-sm font-semibold z-10
            md:text-base 
          "
        >
          R$ {valor}
        </p>

        {imagem ? (
          <img
            src={imagem}
            alt={curso}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            Sem imagem
          </div>
        )}
      </div>

      {/* TÍTULO */}
      <h1 className="text-gray-dark font-bold text-xl md:text-2xl p-4 line-clamp-2">
        {curso}
      </h1>

      {/* CONTEÚDO */}
      <div className="mt-auto p-4 pt-0">
        <p className="text-gray-dark text-sm md:text-base mb-1">
          {`${data} - ${horario}h`}
        </p>

        <p className="text-gray-dark text-sm md:text-base mb-1">
          {`Duração: ${duracao}`}
        </p>

        <p className="text-gray-dark text-sm md:text-base mb-1">
          {`Loja: ${loja}`}
        </p>

        <p className="text-gray-dark text-sm md:text-base mb-3">
          {`Culinarista: ${culinarista}`}
        </p>

        {/* BOTÃO */}
        <button
          className="
            bg-orange-base
            rounded-sm
            p-2
            md:p-3
            w-full
            mt-3
            text-white
            text-sm
            md:text-base
            font-semibold
            cursor-pointer
            hover:bg-orange-light
            hover:shadow-md
            transition-all
          "
          onClick={onClick}
        >
          Garantir minha vaga
        </button>

        <p className="text-gray-dark text-center text-sm md:text-base mt-2">
          {`Vagas: ${vagasLivres}/24`}
        </p>
      </div>
    </div>
  );
}