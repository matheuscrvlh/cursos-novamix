import Lenis from 'lenis'

// Rolagem suave (com inércia) do site público, pela Lenis. Só em tela com
// mouse/trackpad: no celular o toque já tem inércia nativa (e a Lenis nem
// mexe no toque com o syncTouch desligado). Quem pede menos movimento no
// sistema fica com a rolagem nativa.
//
// Uma instância só pra todas as páginas públicas: cada página monta o próprio
// PublicLayout, então o encerramento espera um instante pra ver se a próxima
// página (que monta logo em seguida) ainda vai usar
let lenis = null
let usuarios = 0
let timerEncerrar = null
let pausas = 0

function podeUsar() {
    return window.matchMedia('(pointer: fine)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usarRolagemSuave() {
    usuarios++
    clearTimeout(timerEncerrar)

    if (!lenis && podeUsar()) {
        lenis = new Lenis({
            autoRaf: true,
            // conteúdo com rolagem própria (modal, lista longa) rola nativo,
            // inclusive com a Lenis pausada pelo modal
            allowNestedScroll: true,
            anchors: true,
            stopInertiaOnNavigate: true,
        })
        if (pausas > 0) lenis.stop()
    }

    return () => {
        usuarios--
        if (usuarios > 0) return
        timerEncerrar = setTimeout(() => {
            lenis?.destroy()
            lenis = null
        }, 0)
    }
}

// modal aberto (useBodyScrollLock): a página por trás não pode rolar. Contador
// porque um modal pode abrir antes de o anterior terminar de fechar
export function pausarRolagemSuave() {
    pausas++
    lenis?.stop()
}

export function retomarRolagemSuave() {
    pausas = Math.max(0, pausas - 1)
    if (pausas === 0) lenis?.start()
}

// rola até um número (px) ou elemento. Com a Lenis ligada tem que ser por ela:
// window.scrollTo / scrollIntoView no meio de uma rolagem suave fazem ela
// "puxar" de volta pra posição que estava animando
export function rolarPara(alvo, { offset = 0, imediato = false } = {}) {
    if (lenis) {
        lenis.scrollTo(alvo, { offset, immediate: imediato, force: true })
        return
    }

    const topo = typeof alvo === 'number'
        ? alvo
        : alvo.getBoundingClientRect().top + window.scrollY + offset
    const semAnimacao = imediato || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: topo, left: 0, behavior: semAnimacao ? 'instant' : 'smooth' })
}

export function rolagemSuaveAtiva() {
    return lenis !== null
}
