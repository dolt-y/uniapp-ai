export default {
    getUserInfo: (obj) => {
        wx.getUserInfo({ ...obj, lang: 'zh_CN' })
    },
}