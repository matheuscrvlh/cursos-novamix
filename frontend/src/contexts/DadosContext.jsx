// REACT
import { createContext, useEffect, useState } from 'react';

// SERVICES
import { 
        postCourses,
        getCourses,
        getAssentos,
        getInscricoes,
        getInscricoesTotais,
        getCulinaristas,
        putCourse, 
        putCulinarista, 
        putInscricoes,
        deleteCourse, 
        deleteCulinarista, 
        deleteInscricao,
    } from '../api/courses.service';

export const DadosContext = createContext();

export function DadosProvider({ children }) {
    // ======= STATES
    const [cursos, setCursos] = useState([]);
    const [culinaristas, setCulinaristas] = useState([]);
    const [loading, setLoading] = useState(true);
    // ======= STATES

    // ========= ONLOAD
    // CURSOS
    useEffect(() => {
        getCourses()
            .then(data => {
                setCursos(data)
            })
            .catch(err => {
                console.error('Erro ao buscar cursos', err)
            })
            .finally(() => {
                setLoading(false)
            });
    }, []);

    // CULINARISTAS
    useEffect(() => {
        getCulinaristas()
        .then(data => {
            setCulinaristas(data)
        })
        .catch(err => {
            console.error('Erro ao buscar culinaristas', err)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [])
    // ========= ONLOAD

    // ============  GET  ============
    async function updateCourses() {
        try {
            await getCourses()
                    .then(data => {
                        setCursos(data)
                    });

        } catch (error) {
            console.log('Erro ao atualizar Cursos', error);
            alert('Erro ao atualizar Cursos', error)
        }
    }
    // ============  GET  ============


    // ============  POST  ============
    async function addCourses(formData) {
        try {
            const response = await fetch(`/api/cursos`, {
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

    async function addRegisterClient(data) {
        try {
            const response = await fetch(`/api/inscricoes`, {
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

    async function addCulinarian(formData) {
        try {
            const response = await fetch(`/api/culinaristas`, {
                method: 'POST',
                body: formData, // direto no formData
            });

            if(!response.ok) {
                throw new Error('Erro ao cadastrar culinarista')
            }

            const novaCulinarista = await response.json();

            setCulinaristas(prev => [...prev, novaCulinarista])
        } catch (error) {
            console.log('Erro ao cadastrar culinarista', error);
            alert('Erro ao cadastrar culinarista', error)
        }
    }
    // ============  POST  ============

    // ============  DELETE  ============
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

    async function removeCulinarian(id) {
        try {
            await deleteCulinarista(id)

            setCulinaristas(prev => prev.filter(c => c.id !== id))
        } catch(erro) {
            console.error('Erro ao deletar culinarista', erro)
        }
    }
    // ============  DELETE  ============

    // ============  PUT  ============
    async function editCulinarian(formData) {
        try {
            await putCulinarista(formData.get('id'), formData)

            setCulinaristas(prev => 
                prev.map(culinaristas =>
                    culinaristas.id === formData.get('id')
                    ? {
                        id: formData.get('id'),
                        nomeCulinarista: formData.get('nomeCulinarista'),
                        cpf: formData.get('cpf'),
                        instagram: formData.get('instagram'),
                        industria: formData.get('industria'),
                        telefone: formData.get('telefone'),
                        cursoAtual: formData.get('cursoAtual'),
                        lojas: JSON.parse(formData.get('lojas')),
                        cursos: JSON.parse(formData.get('cursos')),
                        dataCadastro: formData.get('dataCadastro'),
                        foto: formData.get('foto'),
                    }
                    : culinaristas
                ))
        } catch(err) {
            console.log('Erro ao editar culinarista', err)
        }
    }

    async function editCourse(formData) {
        try {
            await putCourse(formData.get('id'), formData) 

            await updateCourses();

        } catch (err) {
            console.error('Erro ao editar curso', err)
            alert('Erro ao editar curso')
        }
    }
    // ============  PUT  ============

    return (
        <DadosContext.Provider
            value={{
                cursos,
                loading,
                addCourses,
                removeCourse,
                editCourse,
                addRegisterClient,
                addCulinarian,
                editCulinarian,
                culinaristas,
                removeCulinarian
            }}
        >
            {children}
        </DadosContext.Provider>
    );
}
