import { db } from '../firebase.js';

// get all templates
export async function getTemplates(req, res) {
    try {
        const userId = req.user.uid;

        // fetch all drill templates for this user, newest first
        const snapshot = await db
            .collection('drillTemplates')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const templates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.json({ templates });

    } catch (err) {
        console.error('getTemplates error:', err);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
}

// save a new template
export async function saveTemplate(req, res) {
    try {
        const userId = req.user.uid;
        const { name, defaultUnit } = req.body;

        // basic validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Template name is required' });
        }

        const trimmedName = name.trim();

        // check for an existing template with the same name for this user
        const existing = await db
            .collection('drillTemplates')
            .where('userId', '==', userId)
            .where('name', '==', trimmedName)
            .limit(1)
            .get();

        if (!existing.empty) {
            return res.status(409).json({ error: 'A template with this name already exists' });
        }

        // build the template - createdAt as string ms timestamp to match mobile
        const template = {
            userId,
            name: trimmedName,
            defaultUnit: defaultUnit || 'reps',
            createdAt: String(Date.now())
        };

        const docRef = await db.collection('drillTemplates').add(template);

        return res.status(201).json({ id: docRef.id, ...template });

    } catch (err) {
        console.error('saveTemplate error:', err);
        res.status(500).json({ error: 'Failed to save template' });
    }
}

// delete a template
export async function deleteTemplate(req, res) {
    try {
        const userId = req.user.uid;
        const templateId = req.params.id;

        const docRef = db.collection('drillTemplates').doc(templateId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // make sure this template belongs to the requesting user
        if (doc.data().userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await docRef.delete();

        return res.json({ success: true });

    } catch (err) {
        console.error('deleteTemplate error:', err);
        res.status(500).json({ error: 'Failed to delete template' });
    }
}