// Intercepta toda resposta fetch da aplicação: se vier 401 com um token salvo,
// a sessão expirou ou o token é inválido — limpa o storage e manda pro login
// na hora, em vez de deixar cada tela lidar (ou não) com o erro por conta própria.
const originalFetch = window.fetch.bind(window)

window.fetch = async (...args) => {
    const response = await originalFetch(...args)

    if (response.status === 401 && localStorage.getItem('token')) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
        const isLoginRequest = url.includes('/api/auth/login')
        const jaEstaNoLogin = window.location.pathname.startsWith('/login')

        if (!isLoginRequest && !jaEstaNoLogin) {
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
            window.location.href = '/login'
        }
    }

    return response
}
