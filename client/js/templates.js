// get all templates
export async function getTemplates(token) {
    const res = await fetch('/api/templates', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch templates');
    const data = await res.json();
    return data.templates || [];
}

// save a new template 
export async function saveTemplate(token, name, defaultUnit) {
    const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, defaultUnit })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save template');
    }
    return await res.json();
}

// delete a template
export async function deleteTemplate(token, id) {
    const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete template');
    return await res.json();
}