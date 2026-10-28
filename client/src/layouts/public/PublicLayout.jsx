import { Link, NavLink } from 'react-router-dom'
import { useContext, useState, useEffect, useLayoutEffect } from 'react'

import { MapPin, Building2, MessageCircle, Menu, X, User, ArrowUp } from 'lucide-react'

import { whatsapp } from '../../assets/images/icons'
import { logoNm } from '../../assets/images/logos'

import { getBanners } from '../../api/banners.services'
import useBodyScrollLock from '../../hooks/useBodyScrollLock'
import { ClienteAuthContext } from '../../contexts/ClienteAuthContext'
import { useTransicao } from '../../contexts/TransicaoContext'
import BannerCarousel from '../../components/public/BannerCarousel'
import { usarRolagemSuave, rolarPara } from '../../utils/rolagemSuave'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Cursos', to: '/cursos' },
  { label: 'Cursos Infantis', to: '/cursosInfantis' },
  { label: 'Culinaristas', to: '/culinaristas' },
  { label: 'Indústrias', to: '/industrias' },
]

const WHATSAPP = 'https://api.whatsapp.com/send?phone=5522998336225'

// bottomBar: a página tem uma barra fixa embaixo no celular (ex: botão de
// inscrição na página do curso) — o rodapé ganha um respiro pra ela não
// cobrir o final dele
export default function PublicLayout({ children, bannerHome, showBanner = true, bottomBar = false }) {
  const { cliente } = useContext(ClienteAuthContext)
  const { navegarComTransicao } = useTransicao()
  const [heroBanners, setHeroBanners] = useState([])
  const [isMenuOpen, setIsMenuOpen]   = useState(false)
  const [rolou, setRolou]             = useState(false)
  const [mostrarTopo, setMostrarTopo] = useState(false)

  useEffect(() => {
    if (!showBanner) return
    getBanners('hero').then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setHeroBanners(data.filter(b => b.ativo))
      }
    })
  }, [showBanner])

  // liga a escala de monitor grande (index.css, html.site-publico) só no site
  // público. Layout effect, não effect: entra antes da primeira pintura, senão
  // a página aparecia pequena e "pulava" de tamanho logo depois de abrir
  useLayoutEffect(() => {
    document.documentElement.classList.add('site-publico')
    return () => document.documentElement.classList.remove('site-publico')
  }, [])

  // o header só ganha sombra depois que a página rola — no topo ele fica
  // "colado" no banner, sem separação
  useEffect(() => {
    const onScroll = () => {
      setRolou(window.scrollY > 8)
      // botão de voltar ao topo só depois de rolar mais ou menos uma tela
      setMostrarTopo(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // rolagem suave com inércia (desktop) — ver utils/rolagemSuave
  useEffect(() => usarRolagemSuave(), [])

  useBodyScrollLock(isMenuOpen)

  // itens do menu: clique comum troca de página com a animação do logo
  // (TransicaoLogo). Ctrl/cmd/shift+clique e botão do meio seguem o normal
  // do link (abrir em nova aba etc.)
  function irComTransicao(e, to) {
    setIsMenuOpen(false)
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (navegarComTransicao(to)) e.preventDefault()
  }

  return (
    <main className="min-h-screen w-full flex flex-col bg-cream text-chocolate"
    >
      <header data-cabecalho className={`w-full bg-orange-base text-white sticky top-0 z-50 transition-shadow duration-700 ${rolou ? 'shadow-[0_10px_30px_-12px_rgba(58,42,33,0.45)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between gap-4">

          <Link to="/" onClick={e => irComTransicao(e, '/')} className="group flex items-center gap-3 shrink-0">
            <img
              src={logoNm}
              alt="Novamix Cursos"
              className="w-10 h-10 rounded-full object-cover ring-1 ring-white/40 ring-offset-2 ring-offset-orange-base transition-transform duration-700 ease-luxo group-hover:rotate-[8deg]"
            />
            <span className="leading-none">
              <span className="block font-serif text-[1.375rem] font-semibold">Novamix</span>
              <span className="block text-[0.5625rem] font-medium uppercase tracking-[0.35em] text-white/75 mt-0.5">Cursos</span>
            </span>
          </Link>

          {/* menu completo só a partir do xl (1280px): com as fontes em versalete
              espaçado ele precisa de ~1170px, e entre o md e isso o header
              estourava (item quebrando linha, "Entrar" fora da tela). Abaixo
              do xl fica o botão que abre o menu lateral */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={e => irComTransicao(e, link.to)}
                // sublinhado fino que desliza da esquerda no hover e fica
                // fixo no link da página atual
                className={({ isActive }) =>
                  `relative px-3 py-2 whitespace-nowrap text-[0.7188rem] font-medium uppercase tracking-[0.16em] transition-colors duration-500
                  after:absolute after:left-3 after:right-3 after:bottom-0.5 after:h-px after:bg-white after:origin-left after:transition-transform after:duration-500 after:ease-luxo ${
                    isActive
                      ? 'text-white after:scale-x-100'
                      : 'text-white/75 hover:text-white after:scale-x-0 hover:after:scale-x-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {/* no celular fica só o ícone: logo + texto + menu não cabem em
                ~390px (o "Atendimento" por extenso continua no menu lateral) */}
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Atendimento pelo WhatsApp"
              className="flex items-center justify-center gap-2 border border-white/35 hover:bg-white hover:text-orange-base transition-colors duration-500 w-9 h-9 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-full text-[0.6875rem] font-medium uppercase tracking-[0.14em] whitespace-nowrap"
            >
              <img src={whatsapp} alt="" className="h-4" />
              <span className="hidden sm:inline">Atendimento</span>
            </a>

            <Link
              to={cliente ? '/minha-conta' : '/entrar'}
              className="hidden sm:flex items-center gap-2 border border-white/35 hover:bg-white hover:text-orange-base transition-colors duration-500 px-3.5 py-2 rounded-full text-[0.6875rem] font-medium uppercase tracking-[0.14em] whitespace-nowrap"
            >
              <User size="0.9375rem" strokeWidth={1.5} />
              <span>{cliente ? 'Minha conta' : 'Entrar'}</span>
            </Link>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="xl:hidden w-9 h-9 flex items-center justify-center rounded-full border border-white/35 hover:bg-white/15 transition"
              aria-label="Abrir menu"
            >
              <Menu size="1.125rem" strokeWidth={1.5} />
            </button>
          </div>

        </div>
      </header>

      <div
        className={`xl:hidden fixed inset-0 bg-chocolate z-60 transition-opacity duration-500 ${
          isMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`xl:hidden fixed top-0 right-0 h-dvh w-72 max-w-[82dvw] bg-cream shadow-2xl z-60 flex flex-col
          transform transition-transform duration-500 ease-luxo
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-chocolate/10">
          <span className="leading-none">
            <span className="block font-serif text-2xl font-semibold text-chocolate">Novamix</span>
            <span className="block text-[0.5625rem] font-medium uppercase tracking-[0.35em] text-gold mt-1">Cursos</span>
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-chocolate/15 hover:bg-cream-dark transition-colors cursor-pointer"
            aria-label="Fechar menu"
          >
            <X size="1rem" strokeWidth={1.5} className="text-chocolate" />
          </button>
        </div>

        <nav className="flex flex-col px-6 py-4">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={e => irComTransicao(e, link.to)}
              className={({ isActive }) =>
                `py-3.5 border-b border-chocolate/[0.07] font-serif text-[1.375rem] font-medium transition-colors duration-500 ${
                  isActive ? 'text-orange-base italic' : 'text-chocolate hover:text-orange-base'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 px-6 mb-6">
          <NavLink
            to={cliente ? '/minha-conta' : '/entrar'}
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center gap-2 py-3.5 rounded-full border border-chocolate/20 text-chocolate text-[0.6875rem] font-medium uppercase tracking-[0.2em] hover:bg-chocolate hover:text-cream transition-colors duration-500"
          >
            <User size="0.9375rem" strokeWidth={1.5} /> {cliente ? 'Minha conta' : 'Entrar'}
          </NavLink>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-orange-base hover:bg-chocolate transition-colors duration-500 text-white py-3.5 rounded-full text-[0.6875rem] font-medium uppercase tracking-[0.2em]"
          >
            <img src={whatsapp} alt="" className="h-4" />
            Atendimento
          </a>
        </div>
      </aside>

      {/* cada página monta o próprio layout, então o fade roda a cada troca de rota */}
      <section className="grow w-full animate-pagina">

        {/* HERO BANNER — desktop 1920×480 · mobile 425×495. Na largura toda da
            tela, no formato 4:1 das artes (o 1920×650 de antes passava de 800px
            de altura em monitor largo) */}
        {showBanner && (heroBanners.length > 0 ? (
          <BannerCarousel banners={heroBanners} />
        ) : (
          <a href='#cursos' className='block w-full'>
            <div className='w-full overflow-hidden bg-orange-base aspect-425/495 md:aspect-4/1'>
              <img src={bannerHome} alt='' className='w-full h-full object-cover object-center' />
            </div>
          </a>
        ))}

        {children}
      </section>

      <footer className={`w-full mt-auto bg-orange-base text-white ${bottomBar ? 'pb-20 lg:pb-0' : ''}`}>

        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr_1fr]">

            <div className="flex flex-col gap-5">
              <p className="leading-none">
                <span className="block font-serif text-[2.125rem] font-semibold">Novamix</span>
                <span className="block text-[0.625rem] font-medium uppercase tracking-[0.35em] text-white/70 mt-1">Cursos</span>
              </p>
              <p className="font-serif italic text-xl font-medium text-white/90 leading-snug max-w-xs">
                Venha desenvolver suas habilidades culinárias com os melhores profissionais.
              </p>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-white/40 hover:bg-white hover:text-orange-base transition-colors duration-500 px-5 py-3 rounded-full w-fit text-[0.6875rem] font-medium uppercase tracking-[0.18em]"
              >
                <img src={whatsapp} alt="" className="h-4" />
                Fale conosco
              </a>
            </div>

            <div>
              <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-white/60 mb-5">Navegação</p>
              <div className="flex flex-col gap-3">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={e => irComTransicao(e, link.to)}
                    className="font-serif text-lg font-medium text-white/90 hover:text-white hover:translate-x-1 transition duration-500 ease-luxo w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-white/60 mb-5">Onde estamos</p>
              <div className="flex flex-col gap-3.5 font-normal">
                <div className="flex items-start gap-2.5 text-sm text-white/85">
                  <MapPin size="0.9375rem" strokeWidth={1.5} className="shrink-0 mt-0.5 text-white/60" />
                  <span>Avenida Governador Roberto Silveira, 1700 – Prado – Nova Friburgo/RJ</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/85">
                  <Building2 size="0.9375rem" strokeWidth={1.5} className="shrink-0 text-white/60" />
                  <span>CNPJ: 19.303.867/0001-44</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/85">
                  <MessageCircle size="0.9375rem" strokeWidth={1.5} className="shrink-0 text-white/60" />
                  <a
                    href={WHATSAPP}
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

        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="border-t border-white/20" />
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1 font-normal">
            <p className="text-white/65 text-xs">
              © {new Date().getFullYear()} Novamix Food Service Comércio de Alimentos Ltda. Todos os direitos reservados.
            </p>
            <p className="text-white/45 text-xs">
              Imagens meramente ilustrativas. Preços e disponibilidade podem variar.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-normal text-white/65 mt-2 md:mt-0">
            <span>Desenvolvido por</span>
            <a href="https://mthcode.com.br" target="_blank" rel="noreferrer" className="text-white font-medium tracking-wider hover:text-white/80 transition">
              MTHCODE
            </a>
            <span>&</span>
            <a
              href="https://www.linkedin.com/in/rodrigo-schuab-628798249"
              target="_blank"
              rel="noreferrer"
              className="text-white font-medium tracking-wider hover:text-white/80 transition"
            >
              RodSchuab
            </a>
          </div>
        </div>

      </footer>

      {/* voltar ao topo — com a barra fixa de inscrição (celular, página do
          curso) sobe pra não ficar em cima dela */}
      <button
        onClick={() => rolarPara(0)}
        aria-label="Voltar ao topo"
        title="Voltar ao topo"
        tabIndex={mostrarTopo ? 0 : -1}
        className={`fixed right-4 md:right-8 z-40 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-chocolate text-cream shadow-[0_12px_30px_-10px_rgba(58,42,33,0.6)] hover:bg-orange-base transition duration-500 ease-luxo cursor-pointer
          ${bottomBar ? 'bottom-24 lg:bottom-8' : 'bottom-5 md:bottom-8'}
          ${mostrarTopo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <ArrowUp size="1.125rem" strokeWidth={1.5} />
      </button>
    </main>
  )
}
