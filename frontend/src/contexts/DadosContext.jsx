// React
import { createContext, useEffect, useState } from 'react';
import { getCourses, deleteCourse } from '../api/courses.service';

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
                console.error('Erro ao buscar cursos', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);


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

            setDados(prev => [...prev, novoCurso]);
        } catch (error) {
            console.error('Erro ao adicionar curso:', error);
            alert('Erro ao adicionar curso');
        }
    }

    
   async function removeCourse(id) {
  try {
    await deleteCourse(id);

    // atualiza global
    setDados(prev => prev.filter(curso => curso.id !== id));
  } catch (err) {
    console.error('Erro ao remover curso', err);
    alert('Erro ao remover curso');
  }
}
    return (
        <DadosContext.Provider
            value={{
                dados,
                loading,
                addCourses,
                removeCourse,
            }}
        >
            {children}
        </DadosContext.Provider>
    );
}
