/**

* utils/request.js
  */

export default function request(url, data = {}, method = 'GET', showError = true) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');
        uni.request({
            url,
            method,
            data,
            header: {
                'Cache-Control': 'no-cache',
                'content-type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            success(res) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                } else {
                    if (showError) {
                        uni.showToast({
                            title: res.data?.msg || '请求失败',
                            icon: 'none'
                        });
                        setTimeout(() => {
                            uni.redirectTo({
                                url: '/pages/login/index'
                            });
                        }, 1500);
                    }
                    reject(res);
                }
            },
            fail(err) {
                if (showError) {
                    uni.showToast({
                        title: '网络错误',
                        icon: 'none'
                    });
                }
                reject(err);
            }
        });
    });
}
