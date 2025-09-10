// pages/home/home.js


Page({

    /**
     * 页面的初始数据
     */
    data: {
      // 用于存储从pubchem获取到的数据
      imageData: '',
      // 用于输入检索依据
      inputValue: '',
      selectedOption: '',
      // 是否显示等待查询的弹窗
      showWaitingModal: false,
      // 是否显示结果展示窗口
      showResultWindow: false,
      // 查询结果数据
      cid: '',
      smiles: '',
      result: {},
      result_str: '',
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
          inputValue: e.detail.value,
          smiles: e.detail.value
      });
  },
  
    // 从pubchem官网获取图片
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

   //复制化合物信息到剪贴板
   copyInfo: function () {
    const jsonArray = this.data.result;
    const jsonString = JSON.stringify(jsonArray);
    wx.setClipboardData({
      data: jsonString,
      success: function () {
        console.log('已复制到剪贴板');
      }
    })
  },
  
    // 调用pubchem库查询cid
    get_info: function () {
        console.log('开始查询');
        // 显示等待查询的弹窗
        this.setData({
          showWaitingModal: true
        });
        // 调用API
        this.get_info_api()
         .then((res) => {
            console.log('访问成功');
            // 隐藏等待查询的弹窗
            this.setData({
              showWaitingModal: false
            });
            console.log(res); // 输出从服务器返回的数据
            this.setData({
              showResult: true,
              result: res,
              smiles: res.smiles
            });
          })
         .catch((err) => {
            console.log('调用formula查询失败：', err);
            // 隐藏等待查询的弹窗
            this.setData({
              showWaitingModal: false
            });
          });
      },
    
    get_info_api: function () {
    return new Promise((resolve, reject) => {
        wx.request({
        url: 'http://47.109.91.221:80/get_compound_info',
        method: 'POST',
        data: {
            "option_key": this.data.inputValue,
            "option": this.data.selectedOption
        },
        header: {
            'Content-Type': 'application/json'
        },
        success: (res) => {
            if (res.statusCode === 200) {
            resolve(res.data);
            } else {
            reject(new Error(`请求失败，状态码: ${res.statusCode}`));
            }
        },
        fail: function (err) {
            reject(err);
        }
        });
    });
    },

    // 确认提示弹窗
    confirm_query: function() {
        this.setData({
            showWaitingModal: false
        });
    },
  
    // 使用rdkit库绘制分子结构图
    rdkit: function () {
        wx.request({
        url: `http://47.109.91.221:5000//smile2png/${this.data.smiles}`, // 阿里云服务器网址
        method: 'GET',
        success: (res) => {
            console.log('服务器返回的数据:', res);
            if (res.statusCode === 200 && res.data) {
            // 服务器返回的数组中，第一个元素是第一张图的base64，第二个是第二张图的base64
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
  
    // 保存图片
    saveImage: function(e) {
        const base64Data = e.currentTarget.dataset.param;
        const fs = wx.getFileSystemManager();
        const FILE_PATH = wx.env.USER_DATA_PATH + '/temp.png'; // 定义临时文件路径，这里以保存为PNG格式命名
    
        // 处理Base64数据前缀，去除类似'data:image/png;base64,'这样的头部信息
        const base64WithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const buffer = wx.base64ToArrayBuffer(base64WithoutPrefix);
    
        // 写入临时文件
        fs.writeFile({
          filePath: FILE_PATH,
          data: buffer,
          encoding: 'binary',
          success: (res) => {
            console.log('临时文件写入成功', res);
            // 保存临时文件到相册
            wx.saveImageToPhotosAlbum({
              filePath: FILE_PATH,
              success: (res) => {
                console.log('图片已成功保存到相册', res);
              },
              fail: (err) => {
                console.error('保存图片到相册失败', err);
              }
            });
          },
          fail: (err) => {
            console.error('临时文件写入失败', err);
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