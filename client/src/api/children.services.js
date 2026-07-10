const URL = '/api'

// ============== POST  
export async function postChildren(formData) {
    try {
        const res = await fetch(`${URL}/cursos-infantis`, {
            method: "POST",
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
            method: 'DELETE'
        }); 
    } catch (err) {
        console.error('Erro ao deletar Curso Infantil:', err);
    }
}   