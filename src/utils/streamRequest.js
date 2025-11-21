export default function streamRequest({ url, data, onMessage, onDone, onError }) {
    const token = wx.getStorageSync('token');

    wx.request({
        url,
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        data,
        responseType: 'text',
        success(res) {
            try {
                const text = res.data
                onMessage && onMessage(text);
                onDone && onDone();
            } catch (err) {
                onError && onError(err);
            }
        },
        fail(err) {
            onError && onError(err);
        }
    });
}
