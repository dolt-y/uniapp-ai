export default function streamRequest({ url, data, onMessage, onDone, onError }) {
    const token = uni.getStorageSync('token');

    const reqTask = uni.request({
        url,
        method: 'POST',
        enableChunked: true,
        header: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        data,
        onChunkReceived(res) {
            console.log('onChunkReceived', res);
            const text = new TextDecoder().decode(res.data);
            const lines = text.split('\n');

            lines.forEach(line => {
                if (!line.startsWith('data: ')) return;
                const payload = line.replace('data: ', '').trim();

                if (payload === '[DONE]') {
                    onDone && onDone();
                    return;
                }

                onMessage && onMessage(payload);
            });
        },

        fail(err) {
            onError && onError(err);
        }
    });

    return reqTask;
}
