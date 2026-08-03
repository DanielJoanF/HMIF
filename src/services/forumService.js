import { apiService } from './apiService';

export const getForumMessages = async () => {
    try {
        const messages = await apiService.get('/forum');
        return messages;
    } catch (error) {
        console.error('Failed to fetch forum messages:', error);
        throw error;
    }
};

export const postForumMessage = async (username, text, website = '') => {
    try {
        const newMessage = await apiService.post('/forum', {
            username: username || 'Anonymous',
            text,
            website
        });
        return newMessage;
    } catch (error) {
        console.error('Failed to post forum message:', error);
        throw error;
    }
};
