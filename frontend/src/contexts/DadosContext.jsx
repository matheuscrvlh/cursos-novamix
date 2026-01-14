// React
import {  createContext, useEffect, useState } from 'react';

// Outros
import { getCourses, postCourses, deleteCourse, putCourse } from '../api/courses.service';

export const DadosContext = createContext();

export function DadosProvider({ children }) {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCourses()
        .then(data => {
            setDados(data);
        })
        .catch(err => {
            console.log('Erro ao buscar cursos', err);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    async function addCourses(curso) {
        const novoCurso = await postCourses(curso);
        setDados(prev => [...prev, novoCurso]);
    }

    async function removeCourse(id) {
        await deleteCourse(id);
        setDados(prev => prev.filter(curso => curso.id !== id));
    }

    async function editCourse(id) {
        await putCourse(id);
        setDados(prev => prev);
    }

    return (
        <DadosContext.Provider value={{ dados, loading, addCourses, removeCourse }}>
            {children}
        </DadosContext.Provider>
    );
}