import { request } from './http'

export function getAssentos(cursoId) {
    return request(`/assentos/${cursoId}`);
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

export function putCourse(id) {
    return request(`/cursos/${id}`, {
        method: 'PUT'
    })
}