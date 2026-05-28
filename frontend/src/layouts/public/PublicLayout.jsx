// React
import { Link, NavLink } from 'react-router-dom'

// Icons
import { MapPin, Building2, MessageCircle } from 'lucide-react'

// Images
import { whatsapp } from '../../assets/images/icons'
import { logoNm } from '../../assets/images/logos'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Cursos', to: '/cursos' },
  { label: 'Cursos Infantis', to: '/cursosInfantis' },
  { label: 'Culinaristas', to: '/culinaristas' },
  { label: 'Indústrias', to: '/industrias' },
]

export default function PublicLayout({ children, bannerHome }) {
  return (
    <main className="min-h-screen w-full flex flex-col bg-gray"
    >
      {/* ================= HEADER ================= */}
      <header className="w-full bg-orange-base text-white shadow-md sticky top-0 z-50">
        <div className="max-w-350 mx-auto px-5 py-3 flex items-center justify-between gap-4">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={logoNm}
              alt="Novamix Cursos"
              className="w-9 h-9 rounded-lg object-cover shadow-sm"
            />
            <span className="font-bold text-sm sm:text-base leading-tight">
              Novamix<br />
              <span className="font-normal text-white/80 text-xs">Cursos</span>
            </span>
          </Link>

          {/* NAV — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* WHATSAPP CTA */}
          <a
            href="https://api.whatsapp.com/send?phone=5522998336225"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0"
          >
            <img src={whatsapp} alt="WhatsApp" className="h-5" />
            <span className="text-xs sm:text-sm">Atendimento</span>
          </a>

        </div>

        {/* NAV — mobile (scrollable row abaixo) */}
        <div className="md:hidden border-t border-white/15 overflow-x-auto min-w-0 w-full">
          <nav className="flex items-center gap-1 px-4 py-2 w-max">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <section className="flex-grow w-full">
        <a href='#cursos'
            className='block w-full'
        >
            <section className="w-full overflow-hidden bg-orange-base"
            >
                <div className="
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
            </section>
        </a>
        {children}
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="w-full mt-auto bg-orange-base text-white">

        {/* MAIN */}
        <div className="max-w-350 mx-auto px-6 py-12 md:px-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

            {/* MARCA */}
            <div className="flex flex-col gap-4">
              <p className="font-bold text-xl tracking-tight">Novamix Cursos</p>
              <p className="text-white/70 text-sm leading-relaxed">
                Venha desenvolver suas habilidades culinárias com os melhores profissionais.
              </p>
              <a
                href="https://api.whatsapp.com/send?phone=5522998336225"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition px-4 py-2.5 rounded-lg w-fit text-sm font-semibold"
              >
                <img src={whatsapp} alt="WhatsApp" className="h-5" />
                Fale conosco
              </a>
            </div>

            {/* NAVEGAÇÃO */}
            <div>
              <p className="font-semibold text-xs uppercase tracking-widest text-white/50 mb-4">Navegação</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Cursos', to: '/cursos' },
                  { label: 'Cursos Infantis', to: '/cursosInfantis' },
                  { label: 'Culinaristas', to: '/culinaristas' },
                  { label: 'Indústrias', to: '/industrias' },
                ].map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-white/75 hover:text-white transition text-sm w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* CONTATO */}
            <div>
              <p className="font-semibold text-xs uppercase tracking-widest text-white/50 mb-4">Onde estamos</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5 text-sm text-white/75">
                  <MapPin size={15} className="shrink-0 mt-0.5 text-white/50" />
                  <span>Avenida Governador Roberto Silveira, 1700 – Prado – Nova Friburgo/RJ</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/75">
                  <Building2 size={15} className="shrink-0 text-white/50" />
                  <span>CNPJ: 19.303.867/0001-44</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/75">
                  <MessageCircle size={15} className="shrink-0 text-white/50" />
                  <a
                    href="https://api.whatsapp.com/send?phone=5522998336225"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    (22) 99833-6225
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DIVISOR */}
        <div className="border-t border-white/15" />

        {/* BOTTOM BAR */}
        <div className="max-w-350 mx-auto px-6 py-5 md:px-16 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-white/55 text-xs">
              © 2025 Novamix Food Service Comércio de Alimentos Ltda. Todos os direitos reservados.
            </p>
            <p className="text-white/35 text-xs">
              Imagens meramente ilustrativas. Preços e disponibilidade podem variar.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60 mt-2 md:mt-0">
            <span>Desenvolvido por</span>
            <a href="https://mthcode.com.br" target="_blank" rel="noreferrer" className="text-white font-bold hover:text-white/80 transition">
              MTHCODE
            </a>
            <span>&</span>
            <a
              href="https://www.linkedin.com/in/rodrigo-schuab-628798249"
              target="_blank"
              rel="noreferrer"
              className="text-white font-bold hover:text-white/80 transition"
            >
              RodSchuab
            </a>
          </div>
        </div>

      </footer>
    </main>
  )
}
