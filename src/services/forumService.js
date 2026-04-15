import { apiService } from './apiService';

export const getForumMessages = async () => {
    try {
        const messages = await apiService.get('/forum');
        return messages;
    } catch (error) {
        console.error('Failed to fetch forum messages:', error);
        return [];
    }
};

export const postForumMessage = async (username, text) => {
    try {
        const newMessage = await apiService.post('/forum', {
            username: username || 'Anonymous',
            text
        });
        return newMessage;
    } catch (error) {
        console.error('Failed to post forum message:', error);
        throw error;
    }
};

