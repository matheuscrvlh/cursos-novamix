// REACT
import { createContext, useEffect, useState } from 'react';

// ======== SERVICES
// COURSES SERVICES
import {
    postCourse,
    getCourses,
    putCourse,
    deleteCourse,
} from '../api/courses.services';

// CULINARIANS SERVICES
import {
    postCulinarian,
    getCulinarians,
    putCulinarian,
    deleteCulinarian,
} from '../api/culinarians.services';

// INDUSTRIES SERVICES
import {
    postIndustry,
    getIndustries,
    putIndustry,
    deleteIndustry,
} from '../api/industries.services';

export const DadosContext = createContext();

export function DadosProvider({ children }) {
    // ======= STATES
    const [cursos, setCursos] = useState([]);
    const [culinaristas, setCulinaristas] = useState([]);
    const [industrias, setIndustrias] = useState([]);

    // ======= States loading
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingCulinarian, setLoadingCulinarian] = useState(true);
    const [loadingIndustries, setLoadingIndustries] = useState(true);
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
                setLoadingCulinarian(false)
            });

        getCulinarians()
            .then(data => {
                setCulinaristas(data)
            })
            .catch(err => {
                console.error('Erro ao buscar Culinaristas', err)
            })
            .finally(() => {
                setLoadingCulinarian(false)
            })

        getIndustries()
            .then(data => {
                setIndustrias(data)
            })
            .catch(err => {
                console.error('Erro ao buscar Industrias', err)
            })
            .finally(() => {
                setLoadingIndustries(false)
            })
    }, []);

    // ============  UPDATE  ============
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
    // ============  UPDATE  ============


    // ============  POST  ============
    async function addCourses(formData) {
        try {
            const res = await postCourse(formData)

            const novoCurso = await res;
            setCursos(prev => [...prev, novoCurso]);

        } catch (error) {
            console.error('Erro ao adicionar curso:', error);
            alert('Erro ao adicionar curso');
        }
    }

    async function addCulinarian(formData) {
        try {
            const res = await postCulinarian(formData)

            const novaCulinarista = await res;
            setCulinaristas(prev => [...prev, novaCulinarista])

        } catch (error) {
            console.log('Erro ao cadastrar culinarista', error);
            alert('Erro ao cadastrar culinarista', error)
        }
    }

    async function addIndustry(formData) {
        try {
            const res = await postIndustry(formData)

            const novaIndustria = await res;
            setIndustrias(prev => [...prev, novaIndustria])

        } catch (error) {
            console.log('Erro ao cadastrar Industria', error);
            alert('Erro ao cadastrar industria', error)
        }
    }
    // ============  POST  ============

    // ============  PUT  ============
    async function editCourse(formData) {
        try {
            await putCourse(formData.get('id'), formData) 

            await updateCourses();

        } catch (err) {
            console.error('Erro ao editar curso', err)
            alert('Erro ao editar curso')
        }
    }

    async function editCulinarian(formData) {
        try {
            await putCulinarian(formData.get('id'), formData)

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

    async function editIndustry(formData) {
        try {
        const updated = await putIndustry(formData.get('id'), formData);

        setIndustrias(prev =>
            prev.map(i =>
                i.id === updated.id ? updated : i
            )
        );
        } catch(err) {
            console.log('Erro ao editar Industrias', err)
        }
    }
    // ============  PUT  ============

    // ============  DELETE  ============
    async function removeCourse(cursoId) {
        try {
            await deleteCourse(cursoId);

            setCursos(prev => prev.filter(curso => curso.id !== cursoId));

        } catch (err) {
            console.error('Erro ao remover curso', err);
            alert('Erro ao remover curso');
        }
    }

    async function removeCulinarian(culinarianId) {
        try {
            await deleteCulinarian(culinarianId)

            setCulinaristas(prev => prev.filter(c => c.id !== culinarianId))

        } catch(erro) {
            console.error('Erro ao deletar culinarista', erro)
        }
    }

    async function removeIndustry(industryId) {
        try {
            await deleteIndustry(industryId)

            setIndustrias(prev => prev.filter(c => c.id !== industryId))

        } catch(erro) {
            console.error('Erro ao deletar Industria', erro)
        }
    }
    // ============  DELETE  ============

    return (
        <DadosContext.Provider
            value={{
                cursos,
                culinaristas,
                industrias,
                loadingCourses,
                loadingCulinarian,
                loadingIndustries,

                addCourses,
                addCulinarian,
                addIndustry,

                editCourse,
                editCulinarian,
                editIndustry,

                removeCourse,
                removeCulinarian,
                removeIndustry,
            }}
        >
            {children}
        </DadosContext.Provider>
    );
}
