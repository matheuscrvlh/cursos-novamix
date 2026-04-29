export default function IndustryCard({
    id,
    foto,
    razaoSocial,
    nome,
    cnpj,
    telefone,
    email,
    site,
    className = '',
    ...props
}) {
    return (
        <div
            key={id}
            className={`
                ${className}
                bg-white rounded-xl p-5 shadow-md
                w-75 max-w-150
                min-h-[380px] max-h-[550px]
                flex flex-col
                hover:shadow-lg transition-shadow
                md:min-w-[300px]
            `}
            {...props}
        >
            <div className="relative rounded-t-xl h-[200px] overflow-hidden bg-gray-base">
                <img
                    src={foto}
                    alt="Imagem Industria"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="rounded-b-xl mt-5">
                <p className="font-semibold">{razaoSocial}</p>
                <p className="font-semibold text-2xl mt-2">{nome}</p>
                <p className="font-semibold">{cnpj}</p>

                <p className="mt-5">Tel: {telefone}</p>
                <p>Email: {email}</p>

                <a
                    href={site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-base"
                >
                    {site}
                </a>
            </div>
        </div>
    )
}