// Fotos dos doces da seção do ateliê, recortadas (fundo transparente), em AVIF
// e WebP pros navegadores sem AVIF. De onde vieram e a licença: FONTES.md
const avif = import.meta.glob('./*.avif', { eager: true, import: 'default' })
const webp = import.meta.glob('./*.webp', { eager: true, import: 'default' })

export function fotoDoce(nome) {
    return { avif: avif[`./${nome}.avif`], webp: webp[`./${nome}.webp`] }
}

// o prato em dois tamanhos (celular e tela grande)
export const fotoPrato = {
    avif: `${avif['./prato-bolo-960.avif']} 960w, ${avif['./prato-bolo-1600.avif']} 1600w`,
    webp: `${webp['./prato-bolo-960.webp']} 960w, ${webp['./prato-bolo-1600.webp']} 1600w`,
    src: webp['./prato-bolo-960.webp'],
}
