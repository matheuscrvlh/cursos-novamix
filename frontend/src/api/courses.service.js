import { request } from './http'

// ======= ASSENTOS
export function getAssentos(cursoId) {
    return request(`/assentos/${cursoId}`);
}

// ======= CULINARISTAS
export function getCulinaristas() {
    return request(`/culinaristas`)
}

export function deleteCulinarista(id) {
    return request(`/culinaristas/${id}`, {
        method: 'DELETE' 
    })
}

// ======= CURSOS
export function getCourses() {
    return request('/cursos');
}

export function postCourses(data) {
    return request('/cursos', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export function deleteCourse(id) {
    return request(`/cursos/${id}`, {
        method: 'DELETE'
    })
}

export function putCourse(id, data) {
    return request(`/cursos/${id}`, {
        method: 'PUT',
        body: data
    });
}