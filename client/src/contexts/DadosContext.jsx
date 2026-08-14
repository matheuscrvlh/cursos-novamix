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

    // curso normal e infantil vivem na mesma tabela (coluna `tipo`) — busca
    // /api/cursos uma vez só e deriva os dois arrays aqui, em vez de bater
    // duas vezes na API pra pegar o que já veio junto na primeira resposta
    async function refreshCourses() {
        const data = await getCourses();
        const todos = Array.isArray(data) ? data : [];
        setCursos(todos.filter(c => c.tipo !== 'infantil'));
        setCursosInfantis(todos.filter(c => c.tipo === 'infantil'));
    }

    async function refreshCulinarians() {
        const data = await getCulinarians();
        setCulinaristas(Array.isArray(data) ? data : []);
    }

    async function refreshIndustries() {
        const data = await getIndustries();
        setIndustrias(Array.isArray(data) ? data : []);
    }

    // alias — mantém os dois nomes que o resto do app já usa (add/edit de
    // curso infantil chamam refreshChildren), mas ambos recarregam a mesma
    // busca única de /api/cursos
    const refreshChildren = refreshCourses;

    useEffect(() => {
        async function carregarInicial() {
            await Promise.all([
                refreshCourses()
                    .catch(err => console.error('Erro ao buscar cursos', err))
                    .finally(() => { setLoadingCourses(false); setLoadingChildren(false); }),
                refreshCulinarians().catch(err => console.error('Erro ao buscar Culinaristas', err)).finally(() => setLoadingCulinarian(false)),
                refreshIndustries().catch(err => console.error('Erro ao buscar Industrias', err)).finally(() => setLoadingIndustries(false)),
            ]);
        }
        carregarInicial();
    }, []);

    async function addCourses(formData) {
        try {
            const res = await postCourse(formData);
            if (!res.ok) return alert(res.message || res.error || 'Erro ao adicionar curso');
            await refreshCourses();
        } catch (error) {
            console.error('Erro ao adicionar curso:', error);
            alert('Erro ao adicionar curso');
        }
    }

    async function addCursoInfantil(formData) {
        try {
            const res = await postChildren(formData);
            if (!res.ok) return alert(res.message || 'Erro ao cadastrar curso infantil');
            await refreshChildren();
        } catch (error) {
            console.error('Erro ao cadastrar curso infantil', error);
            alert('Erro ao cadastrar curso infantil');
        }
    }

    async function addCulinarian(formData) {
        try {
            const res = await postCulinarian(formData);
            if (!res.ok) return alert(res.message || 'Erro ao cadastrar culinarista');
            await refreshCulinarians();
        } catch (error) {
            console.error('Erro ao cadastrar culinarista', error);
            alert('Erro ao cadastrar culinarista');
        }
    }

    async function addIndustry(formData) {
        try {
            const res = await postIndustry(formData);
            if (!res.ok) return alert(res.message || res.error || 'Erro ao cadastrar industria');
            await refreshIndustries();
        } catch (error) {
            console.error('Erro ao cadastrar Industria', error);
            alert('Erro ao cadastrar industria');
        }
    }

    async function editCourse(formData) {
        try {
            const res = await putCourse(formData.get('id'), formData);
            if (!res.ok) return alert(res.message || res.error || 'Erro ao editar curso');
            await refreshCourses();
        } catch (err) {
            console.error('Erro ao editar curso', err);
            alert('Erro ao editar curso');
        }
    }

    async function editCulinarian(formData) {
        try {
            const res = await putCulinarian(formData.get('id'), formData);
            if (!res.ok) return alert(res.message || res.error || 'Erro ao editar culinarista');
            await refreshCulinarians();
        } catch (err) {
            console.error('Erro ao editar culinarista', err);
            alert('Erro ao editar culinarista');
        }
    }

    async function editCursoInfantil(formData) {
        try {
            const res = await putChildren(formData.get('id'), formData);
            if (!res.ok) return alert(res.message || 'Erro ao editar curso infantil');
            await refreshChildren();
        } catch (err) {
            console.error('Erro ao editar curso infantil', err);
            alert('Erro ao editar curso infantil');
        }
    }

    async function editIndustry(formData) {
        try {
            const res = await putIndustry(formData.get('id'), formData);
            if (!res.ok) return alert(res.message || res.error || 'Erro ao editar industria');
            await refreshIndustries();
        } catch (err) {
            console.error('Erro ao editar Industrias', err);
            alert('Erro ao editar industria');
        }
    }

    async function removeCourse(cursoId) {
        try {
            const res = await deleteCourse(cursoId);
            if (!res.ok) return alert(res.message || 'Erro ao remover curso');
            setCursos(prev => prev.filter(curso => curso.id !== cursoId));
        } catch (err) {
            console.error('Erro ao remover curso', err);
            alert('Erro ao remover curso');
        }
    }

    async function removeCursoInfantil(id) {
        try {
            const res = await deleteChildren(id);
            if (!res.ok) return alert(res.message || 'Erro ao deletar curso infantil');
            setCursosInfantis(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Erro ao deletar curso infantil', err);
            alert('Erro ao deletar curso infantil');
        }
    }

    async function removeCulinarian(culinarianId) {
        try {
            const res = await deleteCulinarian(culinarianId);
            if (!res.ok) return alert(res.message || 'Erro ao deletar culinarista');
            setCulinaristas(prev => prev.filter(c => c.id !== culinarianId));
        } catch (err) {
            console.error('Erro ao deletar culinarista', err);
            alert('Erro ao deletar culinarista');
        }
    }

    async function removeIndustry(industryId) {
        try {
            const res = await deleteIndustry(industryId);
            if (!res.ok) return alert(res.message || 'Erro ao deletar industria');
            setIndustrias(prev => prev.filter(c => c.id !== industryId));
        } catch (err) {
            console.error('Erro ao deletar Industria', err);
            alert('Erro ao deletar industria');
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
