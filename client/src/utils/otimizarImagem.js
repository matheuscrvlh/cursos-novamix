// Reduz e comprime uma imagem no próprio navegador antes de enviar pro
// servidor. Os banners do marketing chegam com até 8 MB, o servidor aceita no
// máximo 5 MB por arquivo, e mesmo que aceitasse, o site não pode mandar isso
// pra cada visitante. Redimensiona pra caber em `larguraMax` (nunca aumenta) e
// salva em WebP — ou JPEG, no navegador que não gera WebP. GIF passa direto
// (perderia a animação), e se a versão nova não ficar menor, fica a original.
const LIMITE_SERVIDOR = 5 * 1024 * 1024

export async function otimizarImagem(arquivo, { larguraMax, qualidade = 0.86 }) {
    if (arquivo.type === 'image/gif') return arquivo

    let bitmap
    try {
        bitmap = await createImageBitmap(arquivo)
    } catch {
        throw new Error('Não deu pra abrir essa imagem. Use JPG, PNG ou WebP.')
    }

    const escala = Math.min(1, larguraMax / bitmap.width)
    const largura = Math.round(bitmap.width * escala)
    const altura = Math.round(bitmap.height * escala)
    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, largura, altura)
    bitmap.close?.()

    const gerar = (tipo, q) => new Promise(r => canvas.toBlob(r, tipo, q))
    let blob = await gerar('image/webp', qualidade)
    if (!blob || blob.type !== 'image/webp') blob = await gerar('image/jpeg', 0.9)
    if (!blob) throw new Error('Não deu pra otimizar essa imagem.')

    // imagem já pequena e bem comprimida: a original serve
    if (blob.size >= arquivo.size && escala === 1 && arquivo.size <= LIMITE_SERVIDOR) return arquivo

    const extensao = blob.type === 'image/webp' ? 'webp' : 'jpg'
    const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.' + extensao
    return new File([blob], nome, { type: blob.type })
}

// "8,1 MB", "340 KB"
export function formatarTamanho(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
