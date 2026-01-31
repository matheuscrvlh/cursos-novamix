
// React
import { Link } from 'react-router-dom'

// Components
import Text from '../../components/Text'

// Images
import { stores, whatsapp } from '../../assets/images/icons'

export default function PublicLayout({ children }) {
  return (
    <Text
      as="main"
      className="min-h-screen w-full flex flex-col bg-gray"
    >
      {/* ================= HEADER ================= */}
      <Text as="header" className="
        w-full text-white bg-orange-base
        md:bg-orange-light
      ">
        <Text
          as="div"
          className="
            max-w-[1400px]
            mx-auto
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            md:px-4
            md:py-4
          "
        >
          <Text as="p" className="
            font-semibold text-center text-sm bg-orange-light w-[100vw] p-4 
            md:text-base md:p-0 md:hidden
          ">
            Venha fazer parte dos Cursos NovaMix
          </Text>
          <Text as="div" className="
            flex gap-3 justify-between px-7 py-4
            md:justify-between md:px-5 md:py-0 md:w-full 
          ">
            <Text
              as="a"
              href="https://lojanovamix.com.br"
              className="flex items-center gap-2 text-xs w-full
              md:text-sm md:w-auto
              ">
              <Text as="img" src={stores} alt="Nossas Lojas" className="w-5 h-5 md:w-6 md:h-6" />
              <Text as="span">Nossas Lojas</Text>
            </Text>
            <Text as="p" className="
              font-semibold bg-orange-light w-auto min-w-[320px] hidden text-base p-0 mt-1 text-lg
              hidden md:inline
            ">
              Venha fazer parte dos Cursos NovaMix
            </Text>
            <Text
              as="a"
              href="https://api.whatsapp.com/send?phone=5522998336225"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                items-center
                gap-2
                bg-gray-base
                hover:bg-gray-base/80
                px-3
                py-2
                rounded-md
                text-xs
                md:w-full md:max-w-[230px] md:text-sm
                whitespace-nowrap
              "
            >
              <Text as="img" src={whatsapp} alt="WhatsApp" className="h-[18px] md:h-[22px]" />
              <Text 
                as="p" 
                className="
                  font-semibold w-full
                  hidden md:inline
                ">
                Atendimento WhatsApp
              </Text>
            </Text>
          </Text>
        </Text>
      </Text>

      {/* ================= CONTEÚDO ================= */}
      <Text as="section" className="flex-grow w-full">
        {children}
      </Text>

      {/* ================= FOOTER ================= */}
      <Text as="footer" className="w-full mt-auto">
        <Text as="div" className="h-[8px] bg-gray-dark w-full" />

        <Text
          as="div"
          className="bg-orange-base text-white px-4 py-6 text-sm md:text-base"
        >
          <Text as="p">
            CNPJ: 19.303.867/0001-44 – NOVAMIX FOOD SERVICE COMÉRCIO DE ALIMENTOS LTDA
          </Text>

          <Text as="p" className="mt-2">
            Avenida Governador Roberto Silveira, 1700 – Prado – Nova Friburgo/RJ
          </Text>

          <Text as="p" className="mt-2">
            Imagens meramente ilustrativas. Preços e disponibilidade podem variar.
          </Text>
        </Text>

        <Text
          as="div"
          className="
            bg-orange-light
            text-white
            px-4
            py-4
            flex
            flex-col
            gap-3
            md:flex-row
            md:items-center
          "
        >
          <Text as="p" className="text-center md:text-left text-sm md:text-base">
            © 2023 Novamix Food Service Comércio de Alimentos Ltda.
          </Text>

          <Link
            to="/login"
            className="
                bg-orange-base
                rounded
                px-4
                py-2
                text-center
                text-sm
                md:ml-auto
            "
          >
            Administrativo
          </Link>
        </Text>
      </Text>
    </Text>
  )
}
