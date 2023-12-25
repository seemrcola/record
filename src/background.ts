console.log("background script loaded")
// 监听tab页切换
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    console.log(tab.url)
  })
})
