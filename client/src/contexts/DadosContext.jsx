import { createContext, useEffect, useState } from 'react';

import {
    postCourse,
    getCourses,
    putCourse,
    deleteCourse,
} from '../api/courses.services';

import {
    postCulinarian,
    getCulinarians,
    putCulinarian,
    deleteCulinarian,
} from '../api/culinarians.services';

import {
    postIndustry,
    getIndustries,
    putIndustry,
    deleteIndustry,
} from '../api/industries.services';

import {
    postChildren,
    getChildren,
    putChildren,
    deleteChildren,
} from '../api/children.services';

export const DadosContext = createContext();

export function DadosProvider({ children }) {
    const [cursos, setCursos] = useState([]);
    const [culinaristas, setCulinaristas] = useState([]);
    const [industrias, setIndustrias] = useState([]);
    const [cursosInfantis, setCursosInfantis] = useState([]);

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingCulinarian, setLoadingCulinarian] = useState(true);
    const [loadingIndustries, setLoadingIndustries] = useState(true);
    const [loadingChildren, setLoadingChildren] = useState(true);

    async function refreshCourses() {
        const data = await getCourses();
        setCursos(Array.isArray(data) ? data : []);
    }

    async function refreshCulinarians() {
        const data = await getCulinarians();
        setCulinaristas(Array.isArray(data) ? data : []);
    }

    async function refreshIndustries() {
        const data = await getIndustries();
        setIndustrias(Array.isArray(data) ? data : []);
    }

    async function refreshChildren() {
        const data = await getChildren();
        setCursosInfantis(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
        async function carregarInicial() {
            await Promise.all([
                refreshCourses().catch(err => console.error('Erro ao buscar cursos', err)).finally(() => setLoadingCourses(false)),
                refreshCulinarians().catch(err => console.error('Erro ao buscar Culinaristas', err)).finally(() => setLoadingCulinarian(false)),
                refreshChildren().catch(err => console.error('Erro ao buscar Cursos Infantis', err)).finally(() => setLoadingChildren(false)),
                refreshIndustries().catch(err => console.error('Erro ao buscar Industrias', err)).finally(() => setLoadingIndustries(false)),
            ]);
        }
        carregarInicial();
    }, []);

    async function addCourses(formData) {
        try {
            await postCourse(formData);
            await refreshCourses();
        } catch (error) {
            console.error('Erro ao adicionar curso:', error);
            alert('Erro ao adicionar curso');
        }
    }

    async function addCursoInfantil(formData) {
        try {
            await postChildren(formData);
            await refreshChildren();
        } catch (error) {
            console.error('Erro ao cadastrar curso infantil', error);
        }
    }

    async function addCulinarian(formData) {
        try {
            await postCulinarian(formData);
            await refreshCulinarians();
        } catch (error) {
            console.error('Erro ao cadastrar culinarista', error);
            alert('Erro ao cadastrar culinarista');
        }
    }

    async function addIndustry(formData) {
        try {
            await postIndustry(formData);
            await refreshIndustries();
        } catch (error) {
            console.error('Erro ao cadastrar Industria', error);
            alert('Erro ao cadastrar industria');
        }
    }

    async function editCourse(formData) {
        try {
            await putCourse(formData.get('id'), formData);
            await refreshCourses();
        } catch (err) {
            console.error('Erro ao editar curso', err);
            alert('Erro ao editar curso');
        }
    }

    async function editCulinarian(formData) {
        try {
            await putCulinarian(formData.get('id'), formData);
            await refreshCulinarians();
        } catch (err) {
            console.error('Erro ao editar culinarista', err);
        }
    }

    async function editCursoInfantil(formData) {
        try {
            await putChildren(formData.get('id'), formData);
            await refreshChildren();
        } catch (err) {
            console.error('Erro ao editar curso infantil', err);
        }
    }

    async function editIndustry(formData) {
        try {
            await putIndustry(formData.get('id'), formData);
            await refreshIndustries();
        } catch (err) {
            console.error('Erro ao editar Industrias', err);
        }
    }

    async function removeCourse(cursoId) {
        try {
            await deleteCourse(cursoId);
            setCursos(prev => prev.filter(curso => curso.id !== cursoId));
        } catch (err) {
            console.error('Erro ao remover curso', err);
            alert('Erro ao remover curso');
        }
    }

    async function removeCursoInfantil(id) {
        try {
            await deleteChildren(id);
            setCursosInfantis(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Erro ao deletar curso infantil', err);
        }
    }

    async function removeCulinarian(culinarianId) {
        try {
            await deleteCulinarian(culinarianId);
            setCulinaristas(prev => prev.filter(c => c.id !== culinarianId));
        } catch (err) {
            console.error('Erro ao deletar culinarista', err);
        }
    }

    async function removeIndustry(industryId) {
        try {
            await deleteIndustry(industryId);
            setIndustrias(prev => prev.filter(c => c.id !== industryId));
        } catch (err) {
            console.error('Erro ao deletar Industria', err);
        }
    }

    return (
        <DadosContext.Provider
            value={{
                cursos,
                culinaristas,
                industrias,
                cursosInfantis,

                loadingCourses,
                loadingCulinarian,
                loadingIndustries,
                loadingChildren,

                addCourses,
                addCulinarian,
                addIndustry,
                addCursoInfantil,

                editCourse,
                editCulinarian,
                editIndustry,
                editCursoInfantil,

                removeCourse,
                removeCulinarian,
                removeIndustry,
                removeCursoInfantil,
            }}
        >
            {children}
        </DadosContext.Provider>
    );
}
