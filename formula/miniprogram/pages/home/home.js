// pages/home/home.js


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用于存储从网址获取到的数据，这里假设获取到的是图片数据，以Base64格式存储方便后续显示
    imageData: '',
    // 这里存储可变的部分，比如示例中的 "CCCCBr"，可通过用户输入或其他方式设置此值
    inputValue: '',
    selectedOption: '',
    // 是否显示等待查询的弹窗
    showWaitingModal: false,
    // 是否显示结果展示窗口
    showResultWindow: false,
    // 查询结果数据
    cid: '',
    result: {},
    imageBase64Data1: '', // 存储第一张图片的base64数据
    imageBase64Data2: '' // 存储第二张图片的base64数据
  },

  // 处理查询方式选择的函数
  onOptionChange: function (e) {
    this.setData({
      selectedOption: e.detail.value
    });
  },

  // 输入框内容改变时触发的函数
  onInputChange: function (e) {
    this.setData({
        inputValue: e.detail.value
    });
},

  fetchData: function () {
    const cid = this.data.result.cid;
    if (!cid) {
        wx.showToast({
            title: '请先输入查询内容',
            icon: 'none'
        });
        return;
    }
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`;

    wx.request({
        url: url,
        method: 'POST',
        responseType: 'arraybuffer',
        success: (res) => {
            if (res.statusCode === 200) {
                const base64Data = wx.arrayBufferToBase64(res.data);
                this.setData({
                    imageData: `data:image/png;base64,${base64Data}`
                });
            } else {
                wx.showToast({
                    title: '获取数据失败，状态码：' + res.statusCode,
                    icon: 'none'
                });
            }
        },
        fail: (err) => {
            wx.showToast({
                title: '网络请求失败：' + err.errMsg,
                icon: 'none'
            });
        }
    });
},

  onQueryClick: function () {
        console.log('开始查询')
        // 显示等待查询的弹窗
        this.setData({
            showWaitingModal: true
        });
        wx.request({
            url: 'http://47.109.91.221:80/get_compound_info',
            method: 'POST',
            data: {
                "option_key": this.data.inputValue,
                "option": this.data.selectedOption
            },
            header: {
                'Content-Type': 'application/json' // 设置请求头，表明发送的数据为JSON格式
              },
            success: (res) => {
                console.log('访问成功');
                // 隐藏等待查询的弹窗
                this.setData({
                    showWaitingModal: false
                });
                console.log(res.result); // 这里会输出Python函数的返回结果
                this.setData({
                    result: res.result
                })
            },
            fail: function (err) {
                console.log('调用formula查询失败：', err);
            }
        });
    },

    confirm_query: function() {
        this.setData({
            showWaitingModal: false
        });
    },


    rdkit: function () {
        wx.request({
          url: `http://47.109.91.221:5000//smile2png/${this.data.result.smiles}`, // 替换为实际的服务器接口地址
          method: 'GET',
          success: (res) => {
            console.log('服务器返回的数据:', res);
            if (res.statusCode === 200 && res.data) {
              // 假设服务器返回的数组中，第一个元素是第一张图的base64，第二个是第二张图的
              this.setData({
                imageBase64Data1: res.data.img2d,
                imageBase64Data2: res.data.img3d
              });
            } else {
              console.error('获取图片数据失败，返回格式不符合预期', res);
            }
          },
          fail: (err) => {
            console.error('请求图片数据出错', err);
          }
        });
      },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})