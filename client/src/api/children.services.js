const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============== POST
export async function postChildren(formData) {
    try {
        const res = await fetch(`${URL}/cursos-infantis`, {
            method: "POST",
            headers: { ...authHeader() },
            body: formData
        });
        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Curso Infantil:', err);
    }   
}

// ============== GET
export async function getChildren() {
    try {
        const res = await fetch((`${URL}/cursos-infantis`), {
            method: 'GET'
        }); 
        return res.json()

    }           
    catch (err) {
        console.error('Erro ao buscar Cursos Infantis:', err);
    }   
}

// ============== PUT
export async function putChildren(cursoId, formData) {
    try {
        const res = await fetch((`${URL}/cursos-infantis/${cursoId}`), {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData
        });
        return res.json()   
    } catch (err) {
        console.error('Erro ao editar Curso Infantil:', err);
    }
}   

// ============== DELETE    
export async function deleteChildren(cursoId) {
    try {
        await fetch((`${URL}/cursos-infantis/${cursoId}`), {
            method: 'DELETE',
            headers: { ...authHeader() }
        });
    } catch (err) {
        console.error('Erro ao deletar Curso Infantil:', err);
    }
}   