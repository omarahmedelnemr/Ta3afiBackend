function parse_AI_Text(text) {
    try {
        const keyValuePairs = text.split(',');
        const result = {};

        for (let pair of keyValuePairs) {
            const [key, value] = pair.split(':');
            result[key.trim()] = isNaN(value.trim()) ? value.trim() : parseFloat(value.trim());
        }

        return result;
    } catch (error) {
        console.error("Error parsing text:", error);
        return null;
    }
}

export default parse_AI_Text;
