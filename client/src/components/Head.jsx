import { useEffect } from 'react'

export function Head() {
    useEffect(() => {
        document.title = 'Cursos Novamix'
    }, []);

    return null;
}