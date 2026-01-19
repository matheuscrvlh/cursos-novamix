// React
import { createContext, useEffect, useState } from 'react';
import { getCourses, deleteCourse } from '../api/courses.service';

export const DadosContext = createContext();

export function DadosProvider({ children }) {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);

    // CURSOS
    useEffect(() => {
        getCourses()
            .then(data => {
                setCursos(data);
            })
            .catch(err => {
                console.error('Erro ao buscar cursos', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // ============   SE CADASTRAR (CLIENTE)   ============ 
    async function addRegisterClient(data) {
        try {
            const response = await fetch('http://localhost:3001/inscricoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Erro ao cadastrar na vaga')
            }

        } catch (error) {
            console.error('Erro ao se cadastrar na vaga:', error);
            alert('Erro ao cadastrar-se na vaga.', error)
        }
    }

    // ============   CURSOS   ============ 
    async function addCourses(formData) {
        try {
            const response = await fetch('http://localhost:3001/cursos', {
                method: 'POST',
                body: formData, // direto no formData
            });

            if (!response.ok) {
                throw new Error('Erro ao criar curso');
            }

            const novoCurso = await response.json();

            setCursos(prev => [...prev, novoCurso]);
        } catch (error) {
            console.error('Erro ao adicionar curso:', error);
            alert('Erro ao adicionar curso');
        }
    }

    
   async function removeCourse(id) {
        try {
            await deleteCourse(id);

            // atualiza global
            setCursos(prev => prev.filter(curso => curso.id !== id));
        } catch (err) {
            console.error('Erro ao remover curso', err);
            alert('Erro ao remover curso');
        }
        }
    return (
        <DadosContext.Provider
            value={{
                cursos,
                loading,
                addCourses,
                removeCourse,
                addRegisterClient
            }}
        >
            {children}
        </DadosContext.Provider>
    );
}
