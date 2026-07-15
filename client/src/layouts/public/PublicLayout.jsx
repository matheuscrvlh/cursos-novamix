import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { MapPin, Building2, MessageCircle, Menu, X } from 'lucide-react'

import { whatsapp } from '../../assets/images/icons'
import { logoNm } from '../../assets/images/logos'

import { getBanners } from '../../api/banners.services'
import useBodyScrollLock from '../../hooks/useBodyScrollLock'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Cursos', to: '/cursos' },
  { label: 'Cursos Infantis', to: '/cursosInfantis' },
  { label: 'Culinaristas', to: '/culinaristas' },
  { label: 'Indústrias', to: '/industrias' },
]

export default function PublicLayout({ children, bannerHome }) {
  const navigate = useNavigate();
  const [heroBanners, setHeroBanners] = useState([])
  const [heroIndex, setHeroIndex]     = useState(0)
  const [isMenuOpen, setIsMenuOpen]   = useState(false)

  useEffect(() => {
    getBanners('hero').then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setHeroBanners(data.filter(b => b.ativo))
      }
    })
  }, [])

  useEffect(() => {
    if (heroBanners.length <= 1) return
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroBanners.length), 5000)
    return () => clearInterval(t)
  }, [heroBanners.length])

  useBodyScrollLock(isMenuOpen)

  return (
    <main className="min-h-screen w-full flex flex-col bg-gray"
    >
      <header className="w-full bg-orange-base text-white shadow-md sticky top-0 z-50">
        <div className="max-w-350 mx-auto px-5 py-3 flex items-center justify-between gap-4">

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

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://api.whatsapp.com/send?phone=5522998336225"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
            >
              <img src={whatsapp} alt="WhatsApp" className="h-5" />
              <span className="text-xs sm:text-sm">Atendimento</span>
            </a>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
          </div>

        </div>
      </header>

      <div
        className={`md:hidden fixed inset-0 bg-black z-60 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`md:hidden fixed top-0 right-0 h-dvh w-70 max-w-[80dvw] bg-white shadow-2xl z-60 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-base/20">
          <img src={logoNm} alt="Novamix Cursos" className="w-9 h-9 rounded-lg object-cover shadow-sm" />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray transition-colors cursor-pointer"
            aria-label="Fechar menu"
          >
            <X size={18} className="text-gray-dark" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-orange-base text-white'
                    : 'text-gray-dark hover:bg-gray'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <a
          href="https://api.whatsapp.com/send?phone=5522998336225"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto mx-4 mb-5 flex items-center justify-center gap-2 bg-orange-base hover:bg-orange-light transition text-white py-3 rounded-lg font-semibold text-sm"
        >
          <img src={whatsapp} alt="WhatsApp" className="h-5" />
          Atendimento
        </a>
      </aside>

      <section className="flex-grow w-full">

        {/* HERO BANNER — desktop 1920×480 · mobile 425×495 */}
        {heroBanners.length > 0 ? (
          <div className='relative w-full overflow-hidden bg-orange-base aspect-425/495 md:aspect-4/1'>
            {heroBanners.map((b, i) => {
              const visible = i === heroIndex
              const wrapStyle = {
                position: 'absolute', inset: 0,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.7s',
                pointerEvents: visible ? 'auto' : 'none',
              }
              const imgs = (
                <>
                  <img src={b.imagem} className='absolute inset-0 w-full h-full object-cover hidden md:block' alt='' />
                  <img src={b.imagem_mobile ?? b.imagem} className='absolute inset-0 w-full h-full object-cover md:hidden' alt='' />
                </>
              )
              return b.link
                ? <a key={b.id} href={b.link} target='_blank' rel='noopener noreferrer' style={wrapStyle}>{imgs}</a>
                : <div key={b.id} style={wrapStyle}>{imgs}</div>
            })}
            {heroBanners.length > 1 && (
              <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10'>
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${i === heroIndex ? 'w-4 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <a href='#cursos' className='block w-full'>
            <div className='w-full overflow-hidden bg-orange-base aspect-425/495 md:aspect-4/1'>
              <img src={bannerHome} alt='' className='w-full h-full object-cover object-center' />
            </div>
          </a>
        )}

        {children}
      </section>

      <footer className="w-full mt-auto bg-orange-base text-white">

        <div className="max-w-350 mx-auto px-6 py-12 md:px-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

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

        <div className="border-t border-white/15" />

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
            <span className="mx-1 text-white/20">·</span>
            <button
              onClick={() => navigate('/login')}
              className="text-white/30 hover:text-white/60 transition text-xs cursor-pointer"
            >
              admin
            </button>
          </div>
        </div>

      </footer>
    </main>
  )
}
