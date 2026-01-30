import Text from '../Text';

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
  className,
  onClick
}) {
  return (
    <Text
      as="div"
      className={`
        bg-white
        rounded-xl
        min-h-[380px]
        max-h-[550px]
        flex
        flex-col
        shadow-md
        hover:shadow-lg
        transition-shadow
        ${className || ''}
      `}
    >
      {/* IMAGEM */}
      <Text as="div" className="relative rounded-t-xl h-[200px] overflow-hidden">
        <Text
          as="p"
          className="
            absolute
            top-2
            right-2
            bg-orange-base
            text-white
            rounded-md
            px-2
            py-1
            mx-auto
            text-sm
            md:text-base
            font-semibold
            z-10
          "
        >
          R$ {valor}
        </Text>

        {imagem ? (
          <Text
            as="img"
            src={imagem}
            alt={curso}
            className="w-full h-full object-cover"
          />
        ) : (
          <Text
            as="div"
            className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
          >
            Sem imagem
          </Text>
        )}
      </Text>

      {/* TÍTULO */}
      <Text
        as="h1"
        className="text-blue-base font-bold text-lg md:text-xl p-4 line-clamp-2"
      >
        {curso}
      </Text>

      {/* CONTEÚDO */}
      <Text as="div" className="mt-auto p-4 pt-0">
        <Text as="p" className="text-gray-dark text-sm md:text-base mb-1">
          {`${data} - ${horario}h`}
        </Text>

        <Text as="p" className="text-gray-dark text-sm md:text-base mb-1">
          {`Duração: ${duracao}`}
        </Text>

        <Text as="p" className="text-gray-dark text-sm md:text-base mb-1">
          {`Loja: ${loja}`}
        </Text>

        <Text as="p" className="text-gray-dark text-sm md:text-base mb-3">
          {`Culinarista: ${culinarista}`}
        </Text>

        {/* BOTÃO */}
        <Text
          as="button"
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
          onClick={onClick || undefined}
        >
          Garantir minha vaga
        </Text>

        <Text as="p" className="text-gray-dark text-center text-sm md:text-base mt-2">
          {`Vagas: ${vagasLivres}/24`}
        </Text>
      </Text>
    </Text>
  );
}
