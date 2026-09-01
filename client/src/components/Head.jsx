import { useEffect } from 'react'

// mesma description padrão do index.html — usada como fallback quando uma
// página não passa a própria e pra restaurar ao sair de uma que passou
const DESCRICAO_PADRAO = 'Cursos de culinária Novamix: inscreva-se em cursos com culinaristas parceiros, confira datas, vagas e formas de pagamento.'

export function Head({ title, description }) {
    useEffect(() => {
        document.title = title ? `Cursos Novamix - ${title}` : 'Cursos Novamix'

        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', description || DESCRICAO_PADRAO)

        // não afeta og:description/twitter:description — bots de preview de
        // link (WhatsApp, Facebook, etc.) não executam JS, só leem o HTML
        // estático, então essas tags ficam fixas no index.html
        return () => {
            if (meta) meta.setAttribute('content', DESCRICAO_PADRAO)
        }
    }, [title, description]);

    return null;
}