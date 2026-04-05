// React
import { Link } from 'react-router-dom'

// Components
import Text from '../../components/Text'

// Images
import { stores, whatsapp } from '../../assets/images/icons'

export default function PublicLayout({ children, bannerHome }) {
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
            <Link
              to={'/'}
              className="flex items-center gap-2 text-xs w-full
              md:text-sm md:w-auto
              ">
              <Text as="img" src={stores} alt="Nossas Lojas" className="w-6 h-6 md:w-8 md:h-8" />
              <Text as="span" className='text-sm md:text-base'>Home</Text>
            </Link>
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
                md:w-auto md:text-sm
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
        <Text
            as='a'
            href='#cursos'
            className='block w-full'
        >
            <Text
                as="section"
                className="w-full overflow-hidden bg-orange-base"
            >
                <Text
                    as="div"
                    className="
                            w-full
                            min-h-[160px]
                            bg-no-repeat
                            bg-cover
                            bg-right
                            sm:min-h-[180px]
                            md:min-h-[300px] md:bg-center
                            lg:min-h-[360px]
                            xl:min-h-[400px]
                            "
                    style={{
                        backgroundImage: `url(${bannerHome})`,
                        backgroundPosition: '43% center'
                    }}
                />
            </Text>
        </Text>
        {children}
      </Text>

      {/* ================= FOOTER ================= */}
      <Text as="footer" className="w-full mt-auto bg-orange-base">
        <Text
          as="div"
          className="
            bg-orange-base text-white px-6 py-8 text-sm
            md:pl-20 md:text-lg
          ">
          <Text as="p">
            CNPJ: 19.303.867/0001-44 – NOVAMIX FOOD SERVICE COMÉRCIO DE ALIMENTOS LTDA
          </Text>

          <Text as="p">
            Avenida Governador Roberto Silveira, 1700 – Prado – Nova Friburgo/RJ
          </Text>

          <Text as="p" className="mt-4">
            Imagens meramente ilustrativas. Preços e disponibilidade podem variar.
          </Text>
        </Text>

        <Text
          as="div"
          className="
            bg-orange-light
            text-white
            justify-between
            w-full
            px-6
            py-6
            flex
            flex-col
            gap-3
            md:flex-row
            md:items-center
            md:pl-20
            md:px-15
          "
        >
          <Text as="p" className="text-center md:text-left text-sm md:text-base">
            © 2023 Novamix Food Service Comércio de Alimentos Ltda. Todos os direitos reservados.
          </Text>
          <Text as='div' className='flex flex-col mt-5 md:flex-row md:gap-7 items-center md:text-xl md:mt-0'>
            <Text as='p' className='text-base'>Desenvolvido por</Text>
            <Text as='div' className='flex gap-5'>
              <Text as='a' href='https://mthcode.com.br' target='_blank' className='font-bold cursor-pointer'>MTHCODE</Text>
              <Text 
                as='a' 
                href='https://www.linkedin.com/in/rodrigo-schuab-628798249?utm_source=share_via&utm_content=profile&utm_medium=member_ios' 
                target='_blank' 
                className='font-bold cursor-pointer'
              >
                RodSchuab
              </Text>
            </Text>
          </Text>
        </Text>
      </Text>
    </Text>
  )
}
